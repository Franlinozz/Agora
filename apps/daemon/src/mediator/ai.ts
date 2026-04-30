import OpenAI from 'openai';

import { estimateCents, reserveSpend } from './spend.ts';

const DEFAULT_MODEL = 'gpt-4o-mini';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type MediationDecision = {
  decision: 'approve' | 'needs_review' | 'reject';
  confidence: number;
  rationale: string;
  buyerVisibleSummary: string;
  riskFlags: string[];
  recommendedAction: string;
};

export async function askAgoraChat(question: string, history: ChatMessage[]): Promise<string> {
  const model = process.env.AI_MEDIATOR_MODEL ?? DEFAULT_MODEL;
  const maxTokens = 450;
  const prompt = JSON.stringify({ question, history: history.slice(-8) });
  const openai = openAiClient();
  await reserveSpend(estimateCents(prompt, maxTokens));
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: maxTokens,
    messages: [
      {
        role: 'system',
        content:
          'You are Agora support chat. Answer questions about Agora: an AI-agent marketplace with onchain escrow, BYOK agent runtime, mediator review, Arc/Base support, and thin Vercel proxy architecture. Be concise, practical, and honest. If unsure, say what is implemented vs planned.',
      },
      ...history.slice(-8).map((message) => ({ role: message.role, content: message.content })),
      { role: 'user', content: question },
    ],
  });

  return response.choices[0]?.message.content?.trim() || fallbackChatAnswer(question);
}

export async function mediateDelivery(input: {
  escrow: unknown;
  deliveryPayload: unknown;
}): Promise<MediationDecision> {
  const model = process.env.AI_MEDIATOR_MODEL ?? DEFAULT_MODEL;
  const maxTokens = 700;
  const prompt = JSON.stringify(input);
  const openai = openAiClient();
  await reserveSpend(estimateCents(prompt, maxTokens));
  const response = await openai.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are Agora AI mediator. Review an agent delivery against escrow/task context. Return strict JSON with keys: decision (approve|needs_review|reject), confidence (0-1), rationale, buyerVisibleSummary, riskFlags array, recommendedAction. Prefer needs_review when evidence is incomplete. Do not claim blockchain settlement was executed.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error('AI mediator returned empty response');
  return parseDecision(content);
}

export function fallbackChatAnswer(question: string): string {
  return `I can help with Agora marketplace, escrow, agents, and deployment questions. I could not produce a live AI answer for: “${question.slice(0, 180)}”. Try the docs links or ask a narrower question.`;
}

function openAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for AI mediator calls');
  return new OpenAI({ apiKey });
}

function parseDecision(content: string): MediationDecision {
  const parsed = JSON.parse(content) as Partial<MediationDecision>;
  const decision = parsed.decision;
  if (decision !== 'approve' && decision !== 'needs_review' && decision !== 'reject') {
    throw new Error('AI mediator returned invalid decision');
  }

  return {
    decision,
    confidence: clampConfidence(parsed.confidence),
    rationale: textOrDefault(parsed.rationale, 'No rationale provided.'),
    buyerVisibleSummary: textOrDefault(parsed.buyerVisibleSummary, 'Mediator review completed.'),
    riskFlags: Array.isArray(parsed.riskFlags)
      ? parsed.riskFlags.filter((item): item is string => typeof item === 'string').slice(0, 10)
      : [],
    recommendedAction: textOrDefault(parsed.recommendedAction, 'Review mediator result.'),
  };
}

function clampConfidence(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function textOrDefault(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 2000) : fallback;
}
