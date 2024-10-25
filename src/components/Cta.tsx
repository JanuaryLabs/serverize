import { Card } from '../layouts/Blog/BlogCard';
import TryCommand from './try-command';
import { Button, buttonVariants } from './ui/button';
import { cn } from './utils';

export default function Cta() {
  return (
    <Card reverse={true} hideTop={true}>
      <div className="mx-12 mb-16 mt-4 grid grid-cols-3 items-center gap-x-4">
        <div className="col-span-2 space-y-4">
          <h2 className="text-2xl font-medium">
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
          <div className="flex gap-x-4">
            <a
              href="./cli/#deployments"
              className={cn(buttonVariants(), 'h-10 rounded-full')}
            >
              Serverize Now
            </a>
            <Button
              variant={'outline'}
              className="h-10 rounded-full bg-white text-foreground"
            >
              Contact Sales
            </Button>
          </div>
        </div>
        <div className="col-start-3 space-y-4">
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
              '"h-10 text-foreground" rounded-full bg-white',
            )}
          >
            Join Discord
          </a>
        </div>
      </div>
    </Card>
  );
}
