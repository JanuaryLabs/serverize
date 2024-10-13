// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      // themes: {
      //   dark: 'github-dark',
      //   light: 'github-light',
      // },
    },
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    expressiveCode({ themes: ['github-light', 'github-light'] }),
    mdx(),
  ],
});
 