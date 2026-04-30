import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../../db/client.ts';
import { escrows, mediationLogs, mediationQueue } from '../../db/schema.ts';
import { serializeJson } from '../../lib/json.ts';

export default async function escrowsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const escrow = await db.query.escrows.findFirst({ where: eq(escrows.pk, id) });
    if (!escrow) return reply.code(404).send({ error: 'Escrow not found' });
    const logs = await db.query.mediationLogs.findMany({
      where: eq(mediationLogs.escrowPk, id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 25,
    });
    const queue = await db.query.mediationQueue.findMany({
      where: eq(mediationQueue.escrowPk, id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 10,
    });
    return serializeJson({ escrow, mediatorLog: logs.reverse(), mediationQueue: queue });
  });

  app.get('/:id/log', async (request, reply) => {
    const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
    const logs = await db.query.mediationLogs.findMany({
      where: eq(mediationLogs.escrowPk, id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 25,
    });
    reply.raw.write(
      `data: ${JSON.stringify(serializeJson({ escrowId: id, logs: logs.reverse() }))}\n\n`,
    );
  });
}
