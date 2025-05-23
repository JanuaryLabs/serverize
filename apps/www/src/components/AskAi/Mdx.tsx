import { evaluate } from '@mdx-js/mdx';
import type { EvaluateOptions } from '@mdx-js/mdx';
import type { MDXProps } from 'mdx/types';

import { rehypePlugins } from './rehype';
import { useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

type ReactMDXContent = (props: MDXProps) => ReactNode;
type Runtime = Pick<EvaluateOptions, 'jsx' | 'jsxs' | 'Fragment'>;

const runtime = { jsx, jsxs, Fragment } as Runtime;
export const Preview: FC<{ source?: string }> = ({ source = '' }) => {
  const [MdxContent, setMdxContent] = useState<ReactMDXContent>(
    () => () => null,
  );

  useEffect(() => {
    evaluate(source, {
      ...runtime,
      rehypePlugins: rehypePlugins() as any,
    }).then((r) => setMdxContent(() => r.default));
  }, [source]);

  return <MdxContent />;
};
