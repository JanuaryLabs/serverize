import type { PropsWithChildren } from 'react';
import { useStore } from '@nanostores/react';
import { atom } from 'nanostores';
import Integration from './integration';
import MDXCodeBox from '../code/code';

export const content$ = atom<any>();
export default (
  props: PropsWithChildren<{
    integrations: { name: string; logo: string; Content: any }[];
  }>,
) => {
  const Content = useStore(content$);
   return (
    <>
      {props.integrations.map((it) => (
        <button
          key={it.name}
          onClick={() => {
            console.log(it.Content);
            content$.set(it.Content);
          }}
          className="flex flex-col gap-y-4 group cursor-pointer"
        >
          <div className="w-20 border rounded py-4 px-5 group-hover:bg-slate-100">
            <img className="h-10" src={it.logo} />
          </div>
          <span className="text-sm truncate text-gray-500 font-semibold text-center">
            {it.name}
          </span>
        </button>
      ))}
      {Content && <Content components={{ pre: MDXCodeBox }} />}
    </>
  );
};
