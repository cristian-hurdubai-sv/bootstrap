import { createApiRef } from '@backstage/core-plugin-api';
/**
 * Structure of RandomUser
 */
export type RandomUserItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  nat?: string;
  gender: 'male' | 'female';
  target: string;
};

/**
 * Fields that can be used to filter or order RandomUsers items.
 *
 * @public
 */
export type RandomUserFields = 'id' | 'first_name' | 'last_name' | 'email';
/**
 * Options used to list FirstAPI items.
 *
 * @public
 */
export type FirstApiOptions = {
  offset?: number;
  limit?: number;
  orderBy?: {
    field: RandomUserFields;
    direction: 'asc' | 'desc';
  };
  filters?: {
    field: RandomUserFields;
    /** Value to filter by, with '*' used as wildcard */
    value: string;
  }[];
};

/**
 * The result of listing random users.
 *
 * @public
 */
export type FirstApiResult = {
  items: RandomUserItem[];
  totalCount: number;
  offset: number;
  limit: number;
};

/**
 * The API used by the first-plugin to list all random users.
 *
 * @public
 */
export interface IFirstApi {
  /**
   * Lists all random_users items.
   *
   * @public
   */
  getAll(options?: FirstApiOptions): Promise<FirstApiResult>;
  getById(id: string): Promise<FirstApiResult>;
}

/**
 * ApiRef for the FirstApi.
 *
 * @public
 */
export const firstApiRef = createApiRef<IFirstApi>({
  id: 'plugin.first.api',
});
