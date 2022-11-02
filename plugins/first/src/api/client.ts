import { IFirstApi } from './types';
import { FirstApiOptions, FirstApiResult, RandomUserItem } from './types';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

/**
 * Options for creating a first client.
 *
 * @public
 */
export interface IFirstClientOptions {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
}

export class FirstClient implements IFirstApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;

  constructor(options: IFirstClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  public async getAll(options: FirstApiOptions): Promise<FirstApiResult> {
    const { offset, limit, orderBy, filters } = options;
    const baseUrl = await this.discoveryApi.getBaseUrl('first');
    const { token } = await this.identityApi.getCredentials();

    const query = new URLSearchParams();

    if (typeof offset === 'number') {
      query.set('offset', String(offset));
    }
    if (typeof limit === 'number') {
      query.set('limit', String(limit));
    }
    if (orderBy) {
      query.set('orderBy', `${orderBy.field}=${orderBy.direction}`);
    }
    if (filters) {
      for (const filter of filters) {
        query.append('filter', `${filter.field}=${filter.value}`);
      }
    }

    const res = await fetch(`${baseUrl}/users?${query}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });

    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }

    const data: RandomUserItem[] = await res.json();
    return {
        items: data,
        totalCount: 10000,
        offset: 0,
        limit: 30
    }
  }

  public async getById(id: string): Promise<FirstApiResult> {
    const baseUrl = await this.discoveryApi.getBaseUrl('first');
    const { token } = await this.identityApi.getCredentials();

    const res = await fetch(`${baseUrl}/users/${id}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });
    if (!res.ok) {
        throw await ResponseError.fromResponse(res);
      }
  
      const data: RandomUserItem = await res.json();
      return {
          items: [data],
          totalCount: 1,
          offset: 0,
          limit: 1
      }
  }
}
