import type { MarkdownHeading } from 'astro';
import { Fragment, type PropsWithChildren } from 'react';

interface TocItem {
  text: string;
  slug: string;
  children: TocItem[];
}

export default function Toc(
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
    <ul className="space-y-2">
      {groupToc.children.map((it) => (
        <Fragment key={it.slug}>
          <li
            data-heading={it.slug}
            className="group relative flex text-xs [&.active_span]:inline-block"
          >
            {/* <span className="group-data-[active='true']:after:absolute group-data-[active='true']:after:left-[-1px] group-data-[active='true']:after:h-full group-data-[active='true']:after:w-[1px] group-data-[active='true']:after:bg-red-500"></span> */}
            <span className="absolute -left-2 -top-px hidden group-hover:inline-block group-data-[active='true']:text-blue-500">
              {'{'}
            </span>
            <a href={it.slug} className="text-secondary-foreground/70">
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
                <a href={it.slug} className="text-secondary-foreground/70">
                  {it.text}
                </a>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </ul>
  );
}
