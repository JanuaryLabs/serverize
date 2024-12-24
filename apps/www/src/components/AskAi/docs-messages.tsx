import { type EvaluateOptions } from '@mdx-js/mdx';
import { type FC } from 'react';
type Runtime = Pick<EvaluateOptions, 'jsx' | 'jsxs' | 'Fragment'>;

import rehypeShiki from '@shikijs/rehype';
import { memo } from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import { CodeBox2, TransformCodev2 } from '../code';
import MDXCodeBox from '../code/code';
const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className,
);
export function AssistantMessage(props: { message: string }) {
  // return (
  //   <div className="border-l pl-4 text-sm">
  //     <Preview source={props.message || ''} />
  //   </div>
  // );
  return (
    <div className="border-l pl-4 text-sm">
      <MemoizedReactMarkdown
        components={{
          h1: ({ children }) => <></>,
          h2: ({ children }) => <></>,
          pre: ({ children }) => <MDXCodeBox>{children}</MDXCodeBox>,
          // code: (props) => {
          //   // const { children, className, node, ...rest } = props;
          //   // const match = /language-(\w+)/.exec(className || '');
          //   // console.log({ className, rest });
          //   // return <MDXCodeBox {...props} />;
          //   return <TransformCodev2>{props.children}</TransformCodev2>;
          // },
          // pre: ({ children }) => {
          //   let language = 'txt';
          //   console.log({ children });
          //   try {
          //     language = (children as any).props.className.split(
          //       'language-',
          //     )[1];
          //   } catch {}
          //   return <CodeBox2 language={language}> {children}</CodeBox2>;
          // },
          // pre: (props) => {
          //   const { children, className, node, ...rest } = props;
          //   const match = /language-(\w+)/.exec(className || '');
          //   console.log({ className, rest });
          //   return <MDXCodeBox {...props} />;
          // },
        }}
      >
        {props.message}
      </MemoizedReactMarkdown>
    </div>
  );
}

export function UserMessage({ message }: { message: string }) {
  return (
    <div className="sticky top-0 z-10 block bg-background py-4 text-sm font-semibold text-[#204300]">
      {message}
    </div>
  );
}
