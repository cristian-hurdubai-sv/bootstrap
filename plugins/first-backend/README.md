# first-backend

Welcome to the first-backend backend plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/first-backend](http://localhost:3000/first-backend).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Setup (still experimental)

1. Run:

```bash
# From your Backstage root directory
yarn --cwd packages/app add https://github.com/cristian-hurdubai-sv/plugin-first.git
yarn --cwd packages/backend add https://github.com/cristian-hurdubai-sv/plugin-first-backend.git
```

2. Add `first-backend` plugin to `backend` package:

In a new file named `first.ts` under `backend/src/plugins`:

```js
import { createRouter } from '@internal/plugin-first-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    database: env.database,
  });
}
```

And then add to `packages/backend/src/index.ts`:

```js
import first from './plugins/first';
// ...
async function main() {
    // ...
    const firstEnv = useHotMemoize(module, () => createEnv('first'));
    // ...
    apiRouter.use('/first', await first(firstEnv));
```

3. Add `first` plugin to `app` package:

```jsx
// In packages/app/src/App.tsx

import { FirstPage } from '@internal/plugin-first';
// under routes
const routes = (
  <FlatRoutes>
  // ...
    <Route path="/first" element={<FirstPage />}/>
  </FlatRoutes>
```

```jsx 
// In packages/app/src/components/Root/Root.tsx

// Add to the entry to SidebarGroup
<SidebarGroup label="Menu" icon={<MenuIcon />}>
    // ...
    <SidebarDivider />
    <SidebarScrollWrapper>
    // ...
        <SidebarItem icon={PluginIcon} to="first" text="Demo plugin" />
    </SidebarScrollWrapper>
</SidebarGroup>
```

4. Add `search` RandomUser functionality to `app` package:

```jsx 
// In packages/app/src/components/search/SearchPage.tsx
 // ..
    <Grid item xs={3}>
            <SearchType.Accordion
              name="Result Type"
              defaultValue="software-catalog"
              types={[
                {
                  value: 'software-catalog',
                  name: 'Software Catalog',
                  icon: <CatalogIcon />,
                },
             // ...
                {
                  value: 'random-user',
                  name: 'RandomUser',
                  icon: <UserIcon />,
                },
              ]}
            />
```