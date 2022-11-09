import { firstApiRef, FirstClient } from './api';
import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const firstPlugin = createPlugin({
  id: 'first',
  apis: [
    createApiFactory({
      api: firstApiRef,
      deps: {
        identityApi: identityApiRef,
        discoveryApi: discoveryApiRef,
      },
      factory({ identityApi, discoveryApi }) {
        return new FirstClient({ identityApi, discoveryApi });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const FirstPage = firstPlugin.provide(
  createRoutableExtension({
    name: 'FirstPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
