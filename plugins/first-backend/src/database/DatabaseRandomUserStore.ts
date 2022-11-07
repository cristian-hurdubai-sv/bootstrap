import { apiOptions, RandomUserRow, RawUser } from './types';

import { v4 as uuid } from 'uuid';

import {
  PluginDatabaseManager,
} from '@backstage/backend-common';

import { Knex } from 'knex';
import { applyDatabaseMigrations } from './migrations';

export class DatabaseRandowUserStore {
  private constructor(private readonly db: Knex) {}
  private readonly LIMIT = 500;

  public static async create(
    database: PluginDatabaseManager,
  ): Promise<DatabaseRandowUserStore> {
    const knex = await database.getClient();

    if (!database.migrations?.skip) {
      await applyDatabaseMigrations(knex);
    }
    return new DatabaseRandowUserStore(knex);
  }

  async transaction<T>(fn: (tx: Knex.Transaction) => Promise<T>): Promise<T> {
    return await this.db.transaction(fn);
  }

  async getTransaction(): Promise<Knex.Transaction> {
    return this.db.transaction();
  }

  public async insert(tx: Knex.Transaction, randomUsers: RawUser[]) {
    await tx('random_user').insert(
        randomUsers.map(randomUser => ({
            first_name: randomUser.name.first,
            last_name: randomUser.name.last,
            email: randomUser.email,
            phone: randomUser.phone,
            avatar: randomUser.picture.medium,
            nat: randomUser.nat,
            gender: randomUser.gender,
            id: uuid(),
            target: randomUser.location?.state ?? ""
        })),
      );
  }

  public async getAll(): Promise<RandomUserRow[]> {
    return await this.db('random_user')
        .select('*');
  }

  public async getAllByFilter(options: apiOptions): Promise<RandomUserRow[]> {
    const query = this.db('random_user')
        .select('*')
        .limit(options.limit || this.LIMIT, {skipBinding: true})
        .offset(options.offset || 0);
    return await query;
  }

  public async get(id: string): Promise<RandomUserRow[]> {
    return await this.db('random_user')
        .select('*')
        .where('id', id)
        .first();
  }

  public async delete(id: string): Promise<number> {
    return await this.db('random_user')
        .where('id', id)
        .del();
  }
}