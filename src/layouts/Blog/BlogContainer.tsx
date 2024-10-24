import type { PropsWithChildren } from 'react';
import { cn } from '../../components/utils';

const Line = ({ className = '' }) => (
  <div
    className={cn(
      'h-px w-full via-zinc-400 from-[1%] from-zinc-200 to-zinc-600 absolute -z-0 dark:via-zinc-700 dark:from-zinc-900 dark:to-zinc-500',
      className,
    )}
  />
);
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
        <div className="w-full ">{props.children}</div>
      </div>
    </div>
  </div>
);
export const Card = (props: PropsWithChildren) => {
  return (
    <>
      {/* <BorderedCard className="lg:block hidden">{props.children}</BorderedCard> */}
      <div className="relative mx-auto w-full px-4 sm:px-6 md:px-8">
        <Line className="bg-gradient-to-l left-0 top-2 sm:top-4 md:top-6" />
        <Line className="bg-gradient-to-r bottom-2 sm:bottom-4 md:bottom-6 left-0" />

        <Line className="w-px bg-gradient-to-t right-2 sm:right-4 md:right-6 h-full inset-y-0" />
        <Line className="w-px bg-gradient-to-t left-2 sm:left-4 md:left-6 h-full inset-y-0" />
        <div className="relative z-20 mx-auto py-8">{props.children}</div>
      </div>
    </>
  );
};

export const CardWithNoise = (props: PropsWithChildren) => (
  <div className="border w-full rounded-md overflow-hidden dark:border-zinc-900 dark:bg-zinc-950">
    <div
      className={`size-full bg-[url(https://ui.indie-starter.dev/svg/noise.svg)] bg-repeat bg-[length:500px_500px]`}
    >
      <div className="dark:bg-zinc-950/30">{props.children}</div>
    </div>
  </div>
);

export default function BlogContainer(props: { children: React.ReactNode }) {
  return <Card>{props.children}</Card>;
}
