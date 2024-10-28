import type { RehypeExpressiveCodeOptions } from 'rehype-expressive-code';
import rehypeExpressiveCode from 'rehype-expressive-code';
export const rehypePlugins = () =>
  [
    [
      rehypeExpressiveCode,
      {
        themes: ['github-light', 'github-dark'],
      } satisfies RehypeExpressiveCodeOptions,
    ],
  ] as const;
