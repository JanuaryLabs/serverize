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
  // return props.children;
  return <Card>{props.children}</Card>;
}

export function BlogSidebar(props: PropsWithChildren) {
  return (
    <>
      <div className="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] space-y-4 py-12">
        <div className="space-y-2">
          <p className="font-medium">On This Page</p>
          <ul className="m-0 list-none">
            <li className="mt-0 pt-2">
              <a
                href="#installation"
                className="inline-block text-muted-foreground no-underline transition-colors hover:text-foreground"
              >
                Installation
              </a>
            </li>
            <li className="mt-0 pt-2">
              <a
                href="#examples"
                className="inline-block text-muted-foreground no-underline transition-colors hover:text-foreground"
              >
                Examples
              </a>
              <ul className="m-0 list-none pl-4">
                <li className="mt-0 pt-2">
                  <a
                    href="#vertical"
                    className="inline-block text-muted-foreground no-underline transition-colors hover:text-foreground"
                  >
                    Vertical
                  </a>
                </li>
                <li className="mt-0 pt-2">
                  <a
                    href="#3d"
                    className="inline-block text-muted-foreground no-underline transition-colors hover:text-foreground"
                  >
                    3D
                  </a>
                </li>
              </ul>
            </li>
            <li className="mt-0 pt-2">
              <a
                href="#props"
                className="inline-block text-muted-foreground no-underline transition-colors hover:text-foreground"
              >
                Props
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="font-medium">Contribute</p>
          <ul className="m-0 list-none">
            <li className="mt-0 pt-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                href="https://github.com/magicuidesign/magicui/issues/new?title=%5Bbug%5D%3A+%2Fdocs%2Fcomponents%2Fmarquee&labels=bug&labels=documentation&template=bug_report.md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-bug mr-2 size-4"
                >
                  <path d="m8 2 1.88 1.88" />
                  <path d="M14.12 3.88 16 2" />
                  <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                  <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                  <path d="M12 20v-9" />
                  <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                  <path d="M6 13H2" />
                  <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                  <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                  <path d="M22 13h-4" />
                  <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
                </svg>
                Report an issue
              </a>
            </li>
            <li className="mt-0 pt-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                href="https://github.com/magicuidesign/magicui/issues/new?title=%5Bfeat%5D%3A+%2Fdocs%2Fcomponents%2Fmarquee&labels=enhancement&template=feature_request.md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lightbulb mr-2 size-4"
                >
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                </svg>
                Request a feature
              </a>
            </li>
            <li className="mt-0 pt-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                href="https://github.com/magicuidesign/magicui/blob/main/content/docs/components/marquee.mdx"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pencil mr-2 size-4"
                >
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                  <path d="m15 5 4 4" />
                </svg>
                Edit this page
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
