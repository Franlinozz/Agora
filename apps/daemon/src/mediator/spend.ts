import { eq, sql as drizzleSql } from 'drizzle-orm';

import { db } from '../db/client.ts';
import { llmSpend } from '../db/schema.ts';

export class DailySpendCapExceededError extends Error {
  constructor(public readonly capCents: number) {
    super(`AI mediator daily spend cap reached (${capCents} cents)`);
    this.name = 'DailySpendCapExceededError';
  }
}

export type SpendReservation = {
  dateUtc: string;
  reservedCents: number;
  capCents: number;
};

export function dailyCapCents(): number {
  const parsed = Number(process.env.AI_MEDIATOR_DAILY_CAP_CENTS ?? 20);
  if (!Number.isFinite(parsed) || parsed < 0) return 20;
  return Math.floor(parsed);
}

export function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function estimateCents(input: string, maxOutputTokens: number): number {
  // gpt-4o-mini is far below one cent for these calls, but the DB tracks cents.
  // Round every real LLM call up to at least one cent so the cap is conservative and hard.
  const estimatedInputTokens = Math.ceil(input.length / 4);
  const inputDollars = (estimatedInputTokens / 1_000_000) * 0.15;
  const outputDollars = (maxOutputTokens / 1_000_000) * 0.6;
  return Math.max(1, Math.ceil((inputDollars + outputDollars) * 100));
}

export async function reserveSpend(estimatedCents: number): Promise<SpendReservation> {
  const reservedCents = Math.max(1, Math.ceil(estimatedCents));
  const capCents = dailyCapCents();
  if (capCents <= 0) throw new DailySpendCapExceededError(capCents);

  const dateUtc = utcDateKey();
  await db.insert(llmSpend).values({ dateUtc, centsSpent: 0, callsMade: 0 }).onConflictDoNothing();

  const rows = await db.execute(drizzleSql<typeof llmSpend.$inferSelect>`
    UPDATE llm_spend
    SET cents_spent = cents_spent + ${reservedCents},
        calls_made = calls_made + 1,
        updated_at = NOW()
    WHERE date_utc = ${dateUtc}
      AND cents_spent + ${reservedCents} <= ${capCents}
    RETURNING *
  `);

  if (!rows[0]) throw new DailySpendCapExceededError(capCents);
  return { dateUtc, reservedCents, capCents };
}

export async function currentSpend(): Promise<{
  dateUtc: string;
  centsSpent: number;
  callsMade: number;
  capCents: number;
}> {
  const dateUtc = utcDateKey();
  const row = await db.query.llmSpend.findFirst({ where: eq(llmSpend.dateUtc, dateUtc) });
  if (row) {
    return {
      dateUtc,
      centsSpent: row.centsSpent,
      callsMade: row.callsMade,
      capCents: dailyCapCents(),
    };
  }
  return { dateUtc, centsSpent: 0, callsMade: 0, capCents: dailyCapCents() };
}
