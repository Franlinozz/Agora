import { sql } from './db/client.ts';
import { runMigrations } from './db/migrate.ts';

runMigrations()
  .then(async () => {
    await sql.end({ timeout: 5 });
  })
  .catch(async (error: unknown) => {
    console.error('Migration failed:', error);
    await sql.end({ timeout: 5 });
    process.exitCode = 1;
  });
