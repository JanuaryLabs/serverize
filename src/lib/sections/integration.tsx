import type { PropsWithChildren } from 'react';
import { useStore } from '@nanostores/react';
import { atom } from 'nanostores';

export const selectedIntegration$ = atom('Node.sjs');
export default (
  props: PropsWithChildren<{
    name: string;
    logo: string;
  }>,
) => {
  const selectedIntegration = useStore(selectedIntegration$);

  return (
    <>
      <button
        onClick={() => selectedIntegration$.set(props.name)}
        className="flex flex-col gap-y-4 group cursor-pointer"
      >
        <div className="w-20 border rounded py-4 px-5 group-hover:bg-slate-100">
          <img className="h-10" src={props.logo} />
        </div>
        <span className="text-sm truncate text-gray-500 font-semibold text-center">
          {props.name}
        </span>
      </button>
      {selectedIntegration === props.name && props.children}
    </>
  );
};
