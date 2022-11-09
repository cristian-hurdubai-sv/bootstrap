import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { secondaryPlugin, SecondaryPage } from '../src/plugin';

createDevApp()
  .registerPlugin(secondaryPlugin)
  .addPage({
    element: <SecondaryPage />,
    title: 'Root Page',
    path: '/secondary'
  })
  .render();
