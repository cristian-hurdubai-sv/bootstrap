import { resolvePackagePath } from '@backstage/backend-common';
import { Knex } from 'knex';

export async function applyDatabaseMigrations(knex: Knex): Promise<void> {
  const migrationsDir = resolvePackagePath(
    '@internal/plugin-first-backend',
    'migrations',
  );

  await knex.migrate.latest({
    directory: migrationsDir,
  });
}