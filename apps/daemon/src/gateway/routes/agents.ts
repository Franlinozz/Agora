import { and, asc, count, desc, eq, gte, ilike, lte, type SQL } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getAgent } from '@agora/sdk';

import { db } from '../../db/client.ts';
import { agents, escrows, reputations } from '../../db/schema.ts';
import { serializeJson } from '../../lib/json.ts';

const booleanQueryParam = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

const listQuerySchema = z.object({
  chain: z.string().optional(),
  capability: z.string().optional(),
  minPrice: z.coerce.bigint().optional(),
  maxPrice: z.coerce.bigint().optional(),
  includeInactive: booleanQueryParam.default(false),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).default(0),
});

const deactivateBodySchema = z.object({
  txHash: z.string().optional(),
});

export default async function agentsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async (request) => {
    const query = listQuerySchema.parse(request.query);
    const filters: SQL[] = [];
    if (!query.includeInactive) filters.push(eq(agents.active, true));
    if (query.chain) filters.push(eq(agents.chainId, query.chain));
    if (query.capability) filters.push(ilike(agents.capabilityHash, `%${query.capability}%`));
    if (query.minPrice !== undefined) filters.push(gte(agents.pricePerCallUsdc, query.minPrice));
    if (query.maxPrice !== undefined) filters.push(lte(agents.pricePerCallUsdc, query.maxPrice));

    const orderBy =
      query.sort === 'oldest'
        ? asc(agents.createdAt)
        : query.sort === 'price_asc'
          ? asc(agents.pricePerCallUsdc)
          : query.sort === 'price_desc'
            ? desc(agents.pricePerCallUsdc)
            : desc(agents.createdAt);

    const where = filters.length ? and(...filters) : undefined;
    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(agents)
        .where(where)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(query.offset),
      db.select({ value: count() }).from(agents).where(where),
    ]);

    return { agents: serializeJson(rows), total: totalRows[0]?.value ?? 0, limit: query.limit, offset: query.offset };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const agent = await db.query.agents.findFirst({
      where: eq(agents.pk, id),
    });
    if (!agent) return reply.code(404).send({ error: 'Agent not found' });

    const reputation = await db.query.reputations.findFirst({
      where: eq(reputations.agentPk, agent.pk),
    });

    return serializeJson({ agent, reputation });
  });

  app.post('/:id/deactivate', async (request, reply) => {
    const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const body = deactivateBodySchema.parse(request.body ?? {});
    const indexedAgent = await db.query.agents.findFirst({ where: eq(agents.pk, id) });
    if (!indexedAgent) return reply.code(404).send({ error: 'Agent not found' });

    const onchainAgent = await getAgent(indexedAgent.chainId, indexedAgent.onchainId).catch(() => null);
    if (!onchainAgent) return reply.code(502).send({ error: 'Could not verify agent on-chain' });
    if (onchainAgent.active !== false) {
      return reply.code(409).send({ error: 'Agent is still active on-chain' });
    }

    const [updated] = await db
      .update(agents)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(agents.pk, id))
      .returning();

    return serializeJson({ agent: updated, txHash: body.txHash ?? null });
  });

  app.get('/:id/escrows', async (request) => {
    const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const rows = await db
      .select()
      .from(escrows)
      .where(eq(escrows.agentPk, id))
      .orderBy(desc(escrows.createdAt));
    return { escrows: serializeJson(rows) };
  });

  app.post(
    '/:id/preview',
    { config: { rateLimit: { max: 3, timeWindow: '24 hours' } } },
    async (request) => {
      const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
      return {
        agentId: id,
        status: 'stub',
        output: 'Agent preview runtime will be enabled in Prompt 6.2.',
      };
    },
  );
}
