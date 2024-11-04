import type { MarkdownHeading } from 'astro';
import { Fragment, useEffect, type PropsWithChildren } from 'react';
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

export interface Toc {
  title: string;
  href: string;
  level: number;
}

export default function BlogContainer(props: {
  children: React.ReactNode;
  toc: MarkdownHeading[];
  path: string;
}) {
  return (
    <Card hideLeft={true}>
      <div className="grid grid-cols-1 pt-4 lg:mr-10 md:grid-cols-5">
        <article className="prose col-span-full max-w-full pb-20 md:col-span-3">
          {props.children}
        </article>
        <BlogSidebar
          path={props.path}
          className="col-start-5 hidden md:block"
          toc={(props.toc ?? []).filter(
            (it) => it.depth === 2 || it.depth === 3,
          )}
        ></BlogSidebar>
      </div>
    </Card>
  );
}

export function TocSpy() {
  useEffect(() => {
    document.addEventListener('scroll', () => {
      const items = document.querySelectorAll(`li[data-heading]`);

      const [header] = new Set(
        Array.from(document.querySelectorAll('article h1,h2,h3')).filter(
          isElementVisible,
        ),
      );
      if (!header) return;
      const item = document.querySelector(`li[data-heading="${header.id}"]`);
      if (!item) return;
      items.forEach((item) => {
        item.classList.remove('active');
      });
      item.classList.add('active');
      const nextElVisible = ['H1', 'H2', 'H3'].includes(
        header.nextElementSibling?.tagName || '',
      )
        ? isElementVisible(header.nextElementSibling!)
        : false;

      if (!nextElVisible) {
        item.classList.add('active');
      }
    });
  }, []);
  return <></>;
}

interface TocItem {
  text: string;
  slug: string;
  children: TocItem[];
}

function g() {
  //
}

export function BlogSidebar(
  props: PropsWithChildren<{
    className?: string;
    toc: MarkdownHeading[];
    path: string;
  }>,
) {
  const groupToc: TocItem = {
    text: 'TOC',
    slug: '#',
    children: [],
  };
  const getToc = (depth: number) => {
    let item = groupToc;
    while (--depth) {
      item = item.children.at(-1)!;
    }
    return item;
  };
  for (let i = 0; i < props.toc.length; i++) {
    const it = props.toc[i];
    if (it.depth === 2) {
      getToc(it.depth - 1).children.push({
        text: it.text,
        slug: it.slug,
        children: [],
      });
    }
    if (it.depth === 3) {
      // lone item with no depth-1 parent heading
      if (!getToc(it.depth - 1)) {
        continue;
      }
      getToc(it.depth - 1).children.push({
        text: it.text,
        slug: it.slug,
        children: [],
      });
    }
  }
  return (
    <div
      className={cn(
        'sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] space-y-4 py-12',
        props.className,
      )}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase">In This Page</p>
        <ul className="space-y-2">
          {groupToc.children.map((it) => (
            <Fragment key={it.slug}>
              <li
                data-heading={it.slug}
                className="group relative flex text-xs [&.active_span]:inline-block"
              >
                <span className="absolute -left-2 -top-px hidden group-hover:inline-block group-active:bg-blue-500">
                  {'{'}
                </span>
                <a
                  href={`#${it.slug}`}
                  className="text-secondary-foreground/70"
                >
                  {it.text}
                </a>
              </li>
              <ul className="space-y-2 pl-4">
                {it.children.map((it) => (
                  <li
                    data-heading={it.slug}
                    key={it.slug}
                    className="group relative flex text-xs [&.active_span]:inline-block"
                  >
                    <span className="absolute -left-2 -top-px hidden group-hover:inline-block [&.active]:inline-block">
                      {'{'}
                    </span>
                    <a
                      href={`#${it.slug}`}
                      className="text-secondary-foreground/70"
                    >
                      {it.text}
                    </a>
                  </li>
                ))}
              </ul>
            </Fragment>
          ))}
        </ul>
      </div>
      <div className="space-y-2 text-sm">
        <p className="font-medium">Contribute</p>
        <ul className="space-y-2">
          <a
            target="_blank"
            className="flex cursor-pointer items-center gap-x-2 text-sm hover:underline"
            href="https://github.com/JanuaryLabs/serverize/issues"
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
              className="lucide lucide-bug size-4"
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
          <a
            className="flex cursor-pointer items-center gap-x-2 text-sm hover:underline"
            target="_blank"
            href={`https://github.com/JanuaryLabs/serverize/blob/main/src/pages${props.path}.md`}
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
              className="lucide lucide-pencil size-4"
            >
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" />
            </svg>
            Edit this page
          </a>
          <a
            className="flex cursor-pointer items-center gap-x-2 text-sm hover:underline"
            target="_blank"
            href="https://discord.gg/aj9bRtrmNt"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 127.14 96.36"
              fill="#5865F2"
              className="size-4"
            >
              <g data-name="图层 2">
                <g data-name="Discord Logos">
                  <path
                    d="M107.7 8.07A105.15 105.15 0 0081.47 0a72.06 72.06 0 00-3.36 6.83 97.68 97.68 0 00-29.11 0A72.37 72.37 0 0045.64 0a105.89 105.89 0 00-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0032.17 16.15 77.7 77.7 0 006.89-11.11 68.42 68.42 0 01-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0064.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 01-10.87 5.19 77 77 0 006.89 11.1 105.25 105.25 0 0032.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"
                    data-name="Discord Logo - Large - White"
                  ></path>
                </g>
              </g>
            </svg>
            Ask question
          </a>
        </ul>
      </div>
    </div>
  );
}
function isElementVisible(el: Element) {
  var rect = el.getBoundingClientRect(),
    vWidth = window.innerWidth || document.documentElement.clientWidth,
    vHeight = window.innerHeight || document.documentElement.clientHeight,
    efp = (x: number, y: number) => {
      return document.elementFromPoint(x, y);
    };

  // Return false if it's not in the viewport
  if (
    rect.right < 0 ||
    rect.bottom < 0 ||
    rect.left > vWidth ||
    rect.top > vHeight
  )
    return false;

  // Return true if any of its four corners are visible
  return (
    el.contains(efp(rect.left, rect.top)) ||
    el.contains(efp(rect.right, rect.top)) ||
    el.contains(efp(rect.right, rect.bottom)) ||
    el.contains(efp(rect.left, rect.bottom))
  );
}
