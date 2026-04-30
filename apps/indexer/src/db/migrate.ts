import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { db, sql } from './client.ts';

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: './migrations' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(async () => {
      await sql.end({ timeout: 5 });
    })
    .catch(async (error: unknown) => {
      console.error('Migration failed:', error);
      await sql.end({ timeout: 5 });
      process.exitCode = 1;
    });
}
