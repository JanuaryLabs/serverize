import { Card } from '../layouts/Blog/BlogCard';
import { buttonVariants } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from './utils';

export default function Cta() {
  return (
    <Card reverse={true} hideTop={true}>
      <div className="mx-10 mb-16 mt-4 grid grid-cols-1 items-center justify-center gap-x-4 text-center md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <h2 className="text-xl font-medium md:text-2xl">
            <strong>
              <span className="text-green-700">Serverize</span> your project!
            </strong>{' '}
            <span className="text-secondary-foreground/70">
              Start today with a free account.
            </span>
            <br />
            <span className="block text-secondary-foreground/70">
              Talk to an expert for a personalized demo.
            </span>
          </h2>
          <div className="flex justify-center gap-x-4 md:justify-normal">
            <a
              href="./cli/#deployments"
              className={cn(buttonVariants(), 'h-10 rounded-full no-underline')}
            >
              Serverize Now
            </a>
            <a
              href="https://cal.com/january-sh/30min"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-10 rounded-full bg-white text-foreground no-underline',
              )}
            >
              Contact Sales
            </a>
          </div>
        </div>
        <div className="space-y-4 md:col-start-3">
          <Separator className="mt-6 md:hidden" />
          <p>
            <strong>Would you like to chat?</strong>{' '}
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
    </Card>
  );
}
