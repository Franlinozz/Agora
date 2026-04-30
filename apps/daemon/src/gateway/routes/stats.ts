import { EscrowState } from '@agora/shared';
import { count, countDistinct, eq, gt, sql as drizzleSql, sum } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { db } from '../../db/client.ts';
import { agents, escrows } from '../../db/schema.ts';

export default async function statsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async () => {
    const [totalAgents] = await db.select({ count: count() }).from(agents);
    const [completedEscrows] = await db
      .select({ count: count() })
      .from(escrows)
      .where(eq(escrows.state, EscrowState.Released));
    const [totalSettled] = await db
      .select({ sum: sum(escrows.amountUsdc) })
      .from(escrows)
      .where(eq(escrows.state, EscrowState.Released));
    const [activeWeek] = await db
      .select({ count: countDistinct(escrows.agentPk) })
      .from(escrows)
      .where(gt(escrows.createdAt, drizzleSql`NOW() - INTERVAL '7 days'`));

    return {
      totalAgents: totalAgents?.count ?? 0,
      totalEscrows: completedEscrows?.count ?? 0,
      totalSettledUsdc: totalSettled?.sum?.toString() ?? '0',
      activeAgentsWeek: activeWeek?.count ?? 0,
    };
  });
}
