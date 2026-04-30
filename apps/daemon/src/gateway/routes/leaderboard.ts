import { desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../../db/client.ts';
import { agents, reputations } from '../../db/schema.ts';
import { serializeJson } from '../../lib/json.ts';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

export default async function leaderboardRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async (request) => {
    const query = querySchema.parse(request.query);
    const rows = await db
      .select({ agent: agents, reputation: reputations })
      .from(reputations)
      .innerJoin(agents, eq(agents.pk, reputations.agentPk))
      .orderBy(desc(reputations.weightedScore))
      .limit(query.limit)
      .offset(query.offset);

    return { entries: serializeJson(rows), limit: query.limit, offset: query.offset };
  });
}
