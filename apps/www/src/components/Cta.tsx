import { buttonVariants } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from './utils';

export default function Cta(props: {
  className?: string;
  hideBottom?: boolean;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 items-center justify-center gap-x-4 md:grid-cols-3 md:gap-x-6 lg:gap-x-4',
        props.className,
      )}
    >
      <div className="space-y-4 md:col-span-2">
        <h2 className="text-xl font-medium md:text-2xl">
          <span className="text-foreground">
            <span className="text-green-700">Serverize</span> your project!
          </span>{' '}
          <span className="text-secondary-foreground/70">
            Start today with a free account.
          </span>
          <br />
          <span className="text-secondary-foreground/70 mt-1 block">
            Talk to us for a <span className="text-blue-600">personalized</span>{' '}
            demo.
          </span>
        </h2>
        <div className="flex gap-x-4">
          <a
            href="/docs/deploy/serverize"
            className={cn(buttonVariants(), 'h-10 rounded-full no-underline')}
          >
            Serverize Now
          </a>
          <a
            href="https://cal.com/january-sh/30min"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'text-foreground dark:bg-background h-10 rounded-full bg-white no-underline',
            )}
          >
            or later, whatever
          </a>
        </div>
      </div>
      <div className="hidden space-y-4 md:col-start-3">
        <Separator className="mt-6 md:hidden" />
        <p>
          <span>Would you like to chat?</span>{' '}
          <span className="text-secondary-foreground/70">
            Join our growing community to connect with other Serverize users.
          </span>
        </p>
        <a
          href="https://discord.gg/aj9bRtrmNt"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'text-foreground" h-10 rounded-full bg-white no-underline',
          )}
        >
          Join Discord
        </a>
      </div>
    </div>
  );
}
