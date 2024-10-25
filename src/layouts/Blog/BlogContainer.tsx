import type { PropsWithChildren } from 'react';
import { cn } from '../../components/utils';
import { Card } from './BlogCard';

const Ellipses = () => {
  const sharedClasses =
    'rounded-full outline outline-8 dark:outline-gray-950 sm:my-6 md:my-8 size-1 my-4 outline-gray-50 bg-green-400';
  return (
    <div className="absolute z-0 grid h-full w-full items-center gap-8 lg:grid-cols-2">
      <section className="absolute z-0 grid h-full w-full grid-cols-2 place-content-between">
        <div className={`${sharedClasses} -mx-[2.5px]`}></div>
        <div className={`${sharedClasses} -mx-[2px] place-self-end`}></div>
        <div className={`${sharedClasses} -mx-[2.5px]`}></div>
        <div className={`${sharedClasses} -mx-[2px] place-self-end`}></div>
      </section>
    </div>
  );
};

export const BorderedCard = (
  props: PropsWithChildren<{ className?: string }>,
) => (
  <div
    className={cn(
      'relative mx-auto w-full rounded-lg border border-dashed border-zinc-300 px-4 dark:border-zinc-800 sm:px-6 md:px-8',
      props.className,
    )}
  >
    <div className="absolute left-0 top-4 -z-0 h-px w-full bg-zinc-400 dark:bg-zinc-700 sm:top-6 md:top-8"></div>
    <div className="absolute bottom-4 left-0 z-0 h-px w-full bg-zinc-400 dark:bg-zinc-700 sm:bottom-6 md:bottom-8"></div>
    <div className="relative w-full border-x border-zinc-400 dark:border-zinc-700">
      <Ellipses />
      <div className="relative z-20 mx-auto py-8">
        <div className="w-full">{props.children}</div>
      </div>
    </div>
  </div>
);
export const CardWithNoise = (props: PropsWithChildren) => (
  <div className="w-full overflow-hidden rounded-md border dark:border-zinc-900 dark:bg-zinc-950">
    <div
      className={`size-full bg-[url(https://ui.indie-starter.dev/svg/noise.svg)] bg-[length:500px_500px] bg-repeat`}
    >
      <div className="dark:bg-zinc-950/30">{props.children}</div>
    </div>
  </div>
);

export default function BlogContainer(props: { children: React.ReactNode }) {
  return <Card>{props.children}</Card>;
}
