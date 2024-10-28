// @ts-check
import mdx from '@astrojs/mdx';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import expressiveCode from 'astro-expressive-code';
import {
  remarkCustomCallouts,
  remarkReadingTime,
} from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkCustomCallouts],
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    },
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    expressiveCode({
      plugins: [pluginLineNumbers, pluginCollapsibleSections],
      themes: ['github-light', 'github-dark'],
    }),
    mdx(),
  ],
});
