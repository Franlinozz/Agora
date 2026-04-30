import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { askAgoraChat, fallbackChatAnswer } from '../../mediator/ai.ts';
import { currentSpend, DailySpendCapExceededError } from '../../mediator/spend.ts';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const chatBodySchema = z.object({
  question: z.string().min(1).max(2000),
  history: z.array(chatMessageSchema).max(12).optional(),
});

export default async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.get('/spend', async () => currentSpend());

  app.post('/', async (request) => {
    const body = chatBodySchema.parse(request.body);

    try {
      const answer = await askAgoraChat(body.question, body.history ?? []);
      return {
        tier: 'ai',
        answer,
        spend: await currentSpend(),
      };
    } catch (error) {
      if (error instanceof DailySpendCapExceededError) {
        return {
          tier: 'capped',
          answer:
            "Agora's AI chat budget is done for today. The docs and FAQ still work, and the cap resets at 00:00 UTC.",
          spend: await currentSpend(),
        };
      }

      request.log.warn({ error }, 'AI chat failed; returning fallback answer');
      return {
        tier: 'fallback',
        answer: fallbackChatAnswer(body.question),
        spend: await currentSpend(),
      };
    }
  });
}
