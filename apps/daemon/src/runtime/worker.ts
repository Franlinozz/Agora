import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

import { db } from '../db/client.ts';
import { agents } from '../db/schema.ts';
import { logger } from '../lib/logger.ts';

import { getCredentials, type PlainCredentials } from './byok.ts';
import { validateOutput } from './output-validator.ts';
import {
  claimNextTask,
  enqueueMediation,
  markCompleted,
  markFailed,
  requeueTask,
  type AgentTask,
} from './queue.ts';

const MAX_ATTEMPTS = 3;

type AgentMetadata = {
  systemPrompt?: string;
  outputSchema?: unknown;
  model?: string;
};

export async function workerLoop(workerId: string, signal?: AbortSignal): Promise<void> {
  logger.info({ workerId }, 'Agent runtime worker started');

  while (!signal?.aborted) {
    const task = await claimNextTask(workerId);
    if (!task) {
      await sleep(2_000, signal);
      continue;
    }

    await processTask(workerId, task);
  }

  logger.info({ workerId }, 'Agent runtime worker stopped');
}

async function processTask(workerId: string, task: AgentTask): Promise<void> {
  const started = Date.now();

  try {
    const agent = await db.query.agents.findFirst({ where: eq(agents.pk, task.agentPk) });
    if (!agent) throw new Error(`Agent ${task.agentPk} not found`);

    const metadata = parseAgentMetadata(agent.metadataURI);
    const credentials = await getCredentials(task.agentPk);
    const output = await callAgentLLM(credentials, metadata, task.inputPayload);
    const validated = validateOutput(metadata.outputSchema, output);

    await markCompleted(task.pk, validated);
    await enqueueMediation(task.escrowPk, validated);

    logger.info(
      { workerId, taskId: task.pk, agentPk: task.agentPk, latencyMs: Date.now() - started },
      'Agent task completed',
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (task.attempts < MAX_ATTEMPTS) {
      await requeueTask(task.pk, message);
      logger.warn(
        { workerId, taskId: task.pk, attempt: task.attempts, error },
        'Agent task requeued',
      );
      return;
    }

    await markFailed(task.pk, message);
    logger.error({ workerId, taskId: task.pk, error }, 'Agent task failed');
  }
}

async function callAgentLLM(
  credentials: PlainCredentials,
  metadata: AgentMetadata,
  inputPayload: unknown,
): Promise<unknown> {
  if (credentials.provider === 'openai') return callOpenAI(credentials, metadata, inputPayload);
  if (credentials.provider === 'custom')
    return callCustomProvider(credentials, metadata, inputPayload);
  if (credentials.provider === 'anthropic')
    return callAnthropic(credentials, metadata, inputPayload);
  throw new Error(`Unsupported provider: ${credentials.provider}`);
}

async function callOpenAI(
  credentials: PlainCredentials,
  metadata: AgentMetadata,
  inputPayload: unknown,
): Promise<unknown> {
  const openai = new OpenAI({ apiKey: credentials.apiKey });
  const response = await openai.chat.completions.create({
    model: metadata.model ?? 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          metadata.systemPrompt ??
          'You are an Agora agent. Return only JSON matching the requested output schema.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          input: inputPayload,
          outputSchema: metadata.outputSchema ?? null,
        }),
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error('OpenAI returned empty response');
  return JSON.parse(content) as unknown;
}

async function callCustomProvider(
  credentials: PlainCredentials,
  metadata: AgentMetadata,
  inputPayload: unknown,
): Promise<unknown> {
  if (!credentials.endpointUrl) throw new Error('Custom provider endpoint URL is required');

  const response = await fetch(credentials.endpointUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: inputPayload, metadata }),
  });

  if (!response.ok) throw new Error(`Custom provider failed: ${response.status}`);
  return response.json() as Promise<unknown>;
}

async function callAnthropic(
  credentials: PlainCredentials,
  metadata: AgentMetadata,
  inputPayload: unknown,
): Promise<unknown> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': credentials.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: metadata.model ?? 'claude-3-5-haiku-latest',
      max_tokens: 1024,
      system:
        metadata.systemPrompt ??
        'You are an Agora agent. Return only JSON matching the requested output schema.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            input: inputPayload,
            outputSchema: metadata.outputSchema ?? null,
          }),
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic provider failed: ${response.status}`);
  const json = (await response.json()) as { content?: Array<{ text?: string }> };
  const content = json.content?.find((part) => part.text)?.text;
  if (!content) throw new Error('Anthropic returned empty response');
  return JSON.parse(content) as unknown;
}

function parseAgentMetadata(metadataURI: string): AgentMetadata {
  try {
    if (!metadataURI.startsWith('data:application/json;base64,')) return {};
    return JSON.parse(
      Buffer.from(metadataURI.replace('data:application/json;base64,', ''), 'base64').toString(
        'utf8',
      ),
    ) as AgentMetadata;
  } catch {
    return {};
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}
