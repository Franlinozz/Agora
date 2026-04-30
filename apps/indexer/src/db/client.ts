import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.ts';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to start the indexer');
}

export const sql = postgres(databaseUrl, {
  max: 10,
  prepare: false,
});

export const db = drizzle(sql, { schema });

export type Database = typeof db;

export async function closeDb(): Promise<void> {
  await sql.end({ timeout: 5 });
}
