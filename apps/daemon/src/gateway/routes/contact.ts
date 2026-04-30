import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { logger } from '../../lib/logger.ts';

const contactBodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(4000),
});

export default async function contactRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', async (request) => {
    const body = contactBodySchema.parse(request.body);
    logger.info({ name: body.name, email: body.email }, 'Contact form received');
    return {
      ok: true,
      status: 'queued',
      message: 'Contact delivery provider will be configured before launch.',
    };
  });
}
