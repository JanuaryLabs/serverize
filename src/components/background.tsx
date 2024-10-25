import SearchInput from './SearchInput';
import { Button, buttonVariants } from './ui/button';
import { cn } from './utils';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useEffect, useState, type PropsWithChildren } from 'react';

const GridBackground: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 h-full w-full px-4 py-0">
    <div className="mx-auto flex h-full max-w-[1080px] items-center justify-between">
      <div className="h-full w-[1px] bg-white dark:border-accent dark:bg-background"></div>
      <div className="h-full border-r border-dashed border-gray-200 dark:border-accent"></div>
      <div className="h-full border-r border-dashed border-gray-200 dark:border-accent"></div>
      <div className="h-full border-r border-dashed border-gray-200 dark:border-accent"></div>
      <div className="h-full w-[1px] bg-white dark:border-accent dark:bg-background"></div>
    </div>
  </div>
);

export default function Background(
  props: React.PropsWithChildren<{ className?: string }>,
) {
  return (
    <>
      <Nav />
      <div
        className={cn(
          'relative flex w-full items-center justify-center px-4 py-10',
          props.className,
        )}
      >
        <GridBackgroundDemo className="w-full">
          {/* <nav className="lg:flex hidden px-4 my-4  items-baseline w-full gap-x-2">
          <Logo />
          <div className="ml-4"></div>
          <a
            href="/guides"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'shadow-none rounded-full text-secondary-foreground/70 px-2.5 py-1 h-8',
            )}
          >
            Guides
          </a>
          <div className="ml-auto"></div>
          <Button variant={'outline'} className="shadow-none px-2.5 py-1 h-8">
            Roadmap
          </Button>
          <Button variant={'outline'} className="shadow-none px-2.5 py-1 h-8">
            Feedback
          </Button>
        </nav> */}

          <div className="z-10 flex w-full flex-col items-center">
            {/* <div className="w-full border-b border-dashed dark:border-accent border-gray-200"></div> */}
            <div className="mx-auto flex h-full w-full flex-col items-center justify-center gap-8 px-4 py-16 lg:px-16">
              <div className="relative flex w-full flex-col items-start justify-center gap-4">
                {props.children}
              </div>
            </div>
            {/* <div className="w-full border-t border-dashed dark:border-accent border-gray-200"></div> */}
          </div>
          {/* <GridBackground /> */}
        </GridBackgroundDemo>
      </div>
    </>
  );
}

function Logo() {
  return (
    <a href="/" className="mr-6 flex items-center gap-x-2">
      <MountainIcon className="size-5" />
      <p className="font-mono text-lg font-bold">
        Serveri<span className="inline-block">z</span>e
      </p>
    </a>
  );
}

export function Nav(props: { className?: string }) {
  const items = [
    {
      name: 'Guides',
      href: '/guides',
    },
    {
      name: 'Roadmap',
      href: 'https://github.com/JanuaryLabs/serverize/issues?q=is:open+is:issue+label:%22Feature+request%22+sort:reactions-+1-desc',
      target: '_blank',
    },
    {
      name: 'Feedback',
      href: 'https://github.com/JanuaryLabs/serverize/issues/new',
      target: '_blank',
    },
  ];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <header
      className={cn(
        'flex w-full items-center py-3',
        'bg-background dark:bg-background',
        props.className,
        'sticky top-0 z-50 w-full',
        scrolled ? 'border-b border-border/70' : '',
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center px-4">
        <Logo />
        <nav className="hidden items-center lg:flex">
          {items.map((it) => (
            <a
              key={it.name}
              href={it.href}
              target={it.target}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'text-sm font-medium text-secondary-foreground/70',
              )}
            >
              {it.name}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <SearchInput className="hidden lg:block" />
          <a
            href="https://cal.com/january-sh/30min"
            target="_blank"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'h-8 px-2.5 py-1 shadow-none',
              'hidden lg:flex',
            )}
          >
            Contact
          </a>
          <a
            href="/guides"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'h-8 px-2.5 py-1 shadow-none',
              'flex lg:hidden',
            )}
          >
            Guides
          </a>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <div className="grid gap-6 p-6">
                {items.map((it) => (
                  <a
                    href={it.href}
                    key={it.name}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {it.name}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MenuIcon(props: PropsWithChildren<{ className?: string }>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function MountainIcon(props: PropsWithChildren<{ className?: string }>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export function GridBackgroundDemo(
  props: PropsWithChildren<{ className?: string }>,
) {
  return (
    <div
      className={cn(
        'relative w-full bg-white bg-grid-small-black/[0.2] dark:bg-black dark:bg-grid-small-white/[0.2]',
        props.className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      {props.children}
    </div>
  );
}
