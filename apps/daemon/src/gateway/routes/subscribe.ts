import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../../db/client.ts';
import { subscribers } from '../../db/schema.ts';

const subscribeBodySchema = z.object({
  email: z.string().email(),
});

export default async function subscribeRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', async (request) => {
    const body = subscribeBodySchema.parse(request.body);
    await db.insert(subscribers).values({ email: body.email.toLowerCase() }).onConflictDoNothing();
    return { ok: true };
  });
}
