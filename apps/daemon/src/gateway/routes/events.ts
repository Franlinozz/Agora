import { and, desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import postgres from 'postgres';
import { z } from 'zod';

import { db } from '../../db/client.ts';
import { events } from '../../db/schema.ts';
import { serializeJson } from '../../lib/json.ts';
import { logger } from '../../lib/logger.ts';

const querySchema = z.object({
  address: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export default async function eventsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async (request, reply) => {
    const query = querySchema.parse(request.query);
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    const sendRecent = async () => {
      const filters = query.address
        ? and(eq(events.contractAddress, query.address.toLowerCase()))
        : undefined;
      const rows = await db
        .select()
        .from(events)
        .where(filters)
        .orderBy(desc(events.timestamp))
        .limit(query.limit);
      reply.raw.write(`data: ${JSON.stringify(serializeJson(rows))}\n\n`);
    };

    await sendRecent();

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;

    const listener = postgres(databaseUrl, { max: 1, prepare: false });
    await listener.listen('events_channel', async () => {
      await sendRecent().catch((error: unknown) =>
        logger.error({ error }, 'Failed streaming events'),
      );
    });

    request.raw.on('close', () => {
      void listener.end({ timeout: 1 });
    });
  });
}
