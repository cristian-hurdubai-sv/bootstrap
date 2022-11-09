import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const secondaryPlugin = createPlugin({
  id: 'secondary',
  routes: {
    root: rootRouteRef,
  },
});

export const SecondaryPage = secondaryPlugin.provide(
  createRoutableExtension({
    name: 'SecondaryPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
