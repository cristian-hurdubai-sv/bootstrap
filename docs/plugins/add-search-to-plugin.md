---
id: search-into-plugins
title: Adding a search for a plugin
---

This sections continues the work done on Creating plugins chapters. Here we will instruct the search plugin how to search data through the newly random-user-backend plugin

## Adding a collator
Create a new folder `search` in `/plugins/random-user-backend/src` and add the following files

```typescript
// /plugins/random-user-backend/src/search/RandomUserCollatorFactory.ts

import fetch from 'cross-fetch';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { Readable } from 'stream';
import { RandomUserDocument } from './RandomUserDocument';

export type RandomUserCollatorFactoryOptions = {
  baseUrl?: string;
  logger: Logger;
};
/**
 * 
 * @public
 */
export class RandomUserCollatorFactory implements RandomUserDocument {
    public readonly type: string = 'random-user';
    public id: string = "";
    public email: string = "";
    public firstName: string = "";
    public lastName: string = "";
    public title: string = "";
    public text: string = "";
    public location: string = "";
    public bacthSize: number = 500;

    private readonly baseUrl?: string;
    private readonly logger: Logger;

    private constructor(options: RandomUserCollatorFactoryOptions) {
        this.baseUrl = options.baseUrl;
        this.logger = options.logger;
    }

    public static fromConfig(config: Config, options: RandomUserCollatorFactoryOptions): RandomUserCollatorFactory {
        const baseUrl = config.getOptionalString('randomUser.baseUrl') || 'http://localhost:7007/api/random-user';
        return new RandomUserCollatorFactory({ ...options, baseUrl: `${baseUrl}/users`});
    }

    public async getCollator(): Promise<Readable> {
        return Readable.from(this.execute());
    }

    public async *execute(): AsyncGenerator<RandomUserDocument> {
        if (!this.baseUrl) {
            this.logger.error(`There was no baseUrl defined in yourl app-config.yaml`);
            return;
        }

        let stillHasData: boolean = true;
        let offset = 0;

        while (stillHasData) {
            const query = new URLSearchParams();
            query.set('offset', String(offset));
            query.set('limit', String(this.bacthSize));

            const response = await fetch(this.baseUrl);
            const data = await response.json();

            stillHasData = data.length === this.bacthSize;
            offset += data.length;
            
            for (const user of data) {
                yield {
                    title: user.email,
                    text: `${user.first_name} ${user.last_name}`,
                    location: `/random-user?id=${user.id}`,
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                };
            }
        }
    }
}
```

```typescript
// /plugins/random-user-backend/src/search/RandomUserDocument.ts
import { IndexableDocument } from '@backstage/plugin-search-common';

export interface RandomUserDocument extends IndexableDocument {
    id: string,
    email: string;
    firstName: string;
    lastName: string;
}
```

```typescript
// /plugins/random-user-backend/src/search/index.ts
export { RandomUserCollatorFactory } from './RandomUserCollatorFactory';
export type { RandomUserCollatorFactoryOptions } from './RandomUserCollatorFactory';
```

```typescript
// /plugins/random-user-backend/src/index.ts
export * from './service/router';
export * from './search';
```

With the class `RandomUserCollatorFactory` we provide instruction where backstage should look for indexing the data.
The interface `RandomUserDocument` describes what data should be indexable by search
By default `IndexableDocument` expose these properties 
   - `title` that will be displayed upon result,
   - `text` the result text
   - and `location` the link where to find the correcponding search

## Make the search aware of the new collator
After finishing the previous step where you created the collator, the need is to be linked with the Backstage app; thus you need to modify the search file `packages/backend/src/plugins/search.ts`

```typescript
import { RandomUserCollatorFactory } from '@internal/plugin-random-user-backend';
// ...

    // collator for RandomUsers
    indexBuilder.addCollator({
        schedule,
        factory: RandomUserCollatorFactory.fromConfig(env.config, {
        logger: env.logger,
        }),
    });

```

## Add to new value to the global search filter 
In order to do this you need to modify the SearchPage.tsx inside `packages/app/src/search/SearchPage.tsx`

```typescript
// ...

    <Grid item xs={3}>
            <SearchType.Accordion
              name="Result Type"
              defaultValue="software-catalog"
              types={[

            // ...
                {
                  value: 'random-user',
                  name: 'RandomUser',
                  icon: <UserIcon />,
                },
              ]}

// ...
```
and this should be it. If everything went well, in a short time after the data was indexed you should be able to search as well for the existing users
