import type { MarkdownHeading } from 'astro';

export interface DocNode {
  title?: string;
  navName?: string;
  name?: string;
  subtitle?: string;
  href?: string;
  headings?: MarkdownHeading[];
  children: Record<string, DocNode>;
}

export type DocsTree = Record<string, DocNode>;
