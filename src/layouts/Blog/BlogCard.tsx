import type { PropsWithChildren } from 'react';
import { cn } from '../../components/utils';

const Line = ({ className = '' }) => (
  <div
    className={cn(
      'absolute -z-0 h-px w-full from-zinc-200 from-[1%] via-zinc-400 to-zinc-600 dark:from-zinc-900 dark:via-zinc-700 dark:to-zinc-500',
      className,
    )}
  />
);

export const Card = (
  props: PropsWithChildren<{
    hideBottom?: boolean;
    hideTop?: boolean;
    hideRight?: boolean;
    hideLeft?: boolean;
    reverse?: boolean;
    className?: string;
  }>,
) => {
  return (
    <>
      {/* <BorderedCard className="lg:block hidden">{props.children}</BorderedCard> */}
      <div className={cn('relative mx-auto w-full pb-8 pt-6')}>
        <div className={cn('hidden lg:block')}>
          {!props.hideTop && (
            <Line className="left-0 top-2 bg-gradient-to-l sm:top-4 md:top-6" />
          )}
          {!props.hideRight && (
            <Line
              className={cn(
                'inset-y-0 right-2 h-full w-px bg-gradient-to-t sm:right-4 md:right-6',
                props.reverse && 'bg-gradient-to-b',
              )}
            />
          )}
          {!props.hideLeft && (
            <Line
              className={cn(
                'inset-y-0 left-2 h-full w-px bg-gradient-to-t sm:left-4 md:left-6',
                props.reverse && 'bg-gradient-to-b',
              )}
            />
          )}
          {!props.hideBottom && (
            <>
              <Line className="bottom-2 right-0 bg-gradient-to-l sm:bottom-4 md:bottom-10" />
              <Line className="bottom-2 left-0 bg-gradient-to-r sm:bottom-4 md:bottom-6" />
            </>
          )}
        </div>
        <div className={cn('relative z-20 mx-auto', props.className)}>
          {props.children}
          <div className="pb-2"></div>
        </div>
      </div>
    </>
  );
};
