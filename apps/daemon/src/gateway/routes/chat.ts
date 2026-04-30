import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const chatBodySchema = z.object({
  question: z.string().min(1).max(2000),
  history: z.array(z.unknown()).optional(),
});

export default async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', async (request) => {
    const body = chatBodySchema.parse(request.body);
    return {
      tier: 'stub',
      answer: `I received your question: "${body.question}". The AI mediator chat backend lands in Prompt 6.3.`,
    };
  });
}
