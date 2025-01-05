import { toString } from 'mdast-util-to-string';

import getReadingTime from 'reading-time';
import { visit } from 'unist-util-visit';

export function remarkReadingTime() {
  return (tree, { data }) => {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    // readingTime.text will give us minutes read as a friendly string,
    // i.e. "3 min read"
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}

export function remarkCustomCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      if (!node.children || !node.children.length) return;

      const firstChild = node.children[0];
      if (
        firstChild.type === 'paragraph' &&
        firstChild.children[0].type === 'text'
      ) {
        const text = firstChild.children[0].value.trim();

        // Match callouts like [!NOTE], [!CAUTION], [!WARNING]
        const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/.exec(text);
        if (match) {
          const type = match[1].toLowerCase();

          firstChild.children[0].value = firstChild.children[0].value
            .replace(`[!${match[1]}]`, '')
            .trim();

          const titleNode = {
            type: 'element',
            tagName: 'h5',
            children: [
              {
                type: 'text',
                value: match[1].charAt(0) + match[1].slice(1).toLowerCase(),
              },
            ],
            data: {
              hName: 'h5',
            },
          };

          node.children = [titleNode, div({ children: node.children })];

          node.data = node.data || {};
          node.data.hProperties = {
            ...node.data.hProperties,
            className: `callout ${type}`,
          };
        }
      }
    });
  };
}

function div(props) {
  return {
    type: 'element',
    tagName: 'div',
    children: props.children,
    data: {
      hName: 'div',
      hProperties: {
        className: props.className,
      },
    },
  };
}
