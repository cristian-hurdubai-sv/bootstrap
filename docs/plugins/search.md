---
id: search
title: Configuring Search plugin
---

## Getting Started
By default, when you create a new backstage app, the search plugin is already installed.
Backstage supports 3 search engines by default:
1. in-memory engine called `Lunr`
2. in database - `Postgres`
3. Elasticsearch

## Lunr
Lunr engine is enabled by default so if you want to use the other engines you need to make aditional configurations.
While this is a good engine to use on a smaller scale and for local development (to avoid having to set up a search engine instance separately), it also has its limitations such as:

1. Lunr does not scale well. Horizontally scaled deployments of Backstage and/or Backstage Search backend using Lunr result in either duplicated indexing processes and indices or inconsistent index state across nodes.

2. Lunr’s filter functionality is limited, especially for logical AND/OR operators.

3. Lunr has a smaller community than `Elasticsearch`, which could mean that adopters relying on it will have less by way of resources for iterating on and improving search.

Therefore in a production environment it is recommended to use something else like `Elasticsearch` or `Postgres`

## Postgres
The Postgres based search engine only requires that postgres being configured as the database engine for Backstage. Therefore it targets setups that want to avoid maintaining another external service like elastic search. The search provides **decent results** and performs well with **ten thousands of indexed documents**. The connection to postgres is established via the database manager also used by other plugins.

In order to use postgres you need to install the additional `PgSearchEngine` which is part of `@backstage/plugin-search-backend-module-pg` package.

```shell
yarn add --cwd packages/backend @backstage/plugin-search-backend-module-pg
```

```typescript
// In packages/backend/src/plugins/search.ts

// Initialize a connection to a search engine.
const searchEngine = (await PgSearchEngine.supported(env.database))
  ? await PgSearchEngine.fromConfig(env.config, { database: env.database })
  : new LunrSearchEngine({ logger: env.logger });
```

### Optional Configuration

The following is an example of the optional configuration that can be applied when using Postgres as the search backend. Currently this is mostly for just the highlight feature:

```yaml
search:
  pg:
    highlightOptions:
      useHighlight: true # Used to enable to disable the highlight feature. The default value is true
      maxWord: 35 # Used to set the longest headlines to output. The default value is 35.
      minWord: 15 # Used to set the shortest headlines to output. The default value is 15.
      shortWord: 3 # Words of this length or less will be dropped at the start and end of a headline, unless they are query terms. The default value of three (3) eliminates common English articles.
      highlightAll: false # If true the whole document will be used as the headline, ignoring the preceding three parameters. The default is false.
      maxFragments: 0 # Maximum number of text fragments to display. The default value of zero selects a non-fragment-based headline generation method. A value greater than zero selects fragment-based headline generation (see the linked documentation above for more details).
      fragmentDelimiter: ' ... ' # Delimiter string used to concatenate fragments. Defaults to " ... ".
```

**Note:** the highlight search term feature uses `ts_headline` which has been known to potentially impact performance. You only need this minimal config to disable it should you have issues: `useHighlight: false`


## Tech Stack

| Stack                     | Location                                              |
| ------------------------- | ----------------------------------------------------- |
| Frontend Plugin           | @backstage/plugin-search                              |
| Frontend Plugin Library   | @backstage/plugin-search-react                        |
| Isomorphic Plugin Library | @backstage/plugin-search-common                       |
| Backend Plugin            | @backstage/plugin-search-backend                      |
| Backend Plugin Library    | @backstage/plugin-search-backend-node                 |
| Backend Plugin Module     | @backstage/plugin-search-backend-module-elasticsearch |
| Backend Plugin Module     | @backstage/plugin-search-backend-module-pg            |

** The module `@backstage/plugin-search-backend-module-elasticsearch` is maintained by the search team whereas `@backstage/plugin-search-backend-module-pg` is being maintained by the community. For the POC we will go with postgresql;