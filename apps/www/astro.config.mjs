import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

import { fileURLToPath } from 'url';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import {
  remarkCustomCallouts,
  remarkReadingTime,
} from '../../tools/remark.mjs';

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  site: 'https://serverize.sh',
  redirects: {
    '/guides/next': 'guides/nextjs',
    '/guides/nuxt': 'guides/nuxtjs',
    '/guides/node': 'guides/nodejs',
    '/docs/concepts': '/docs/concepts/projects',
    '/docs/deploy': '/docs/deploy/serverize',
    '/docs/cli': '/docs/cli/auth',
  },
  outDir: '../../dist/apps/www',
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
    partytown(),
    tailwind({
      applyBaseStyles: false,
      configFile: fileURLToPath(
        new URL('./tailwind.config.mjs', import.meta.url),
      ),
    }),
    expressiveCode({
      plugins: [pluginLineNumbers, pluginCollapsibleSections],
      themes: ['github-light', 'github-dark'],
    }),
    sitemap(),
  ],
});
