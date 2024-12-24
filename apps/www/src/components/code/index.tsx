import classNames from 'classnames';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Fragment, isValidElement, useRef } from 'react';
import useCopyToClipboard from './useCopyToClipboard';

import styles from './index.module.css';

// Transforms a code element with plain text content into a more structured
// format for rendering with line numbers
const transformCode = (code: ReactNode): ReactNode => {
  if (!isValidElement(code)) {
    // Early return when the `CodeBox` child is not a valid element since the
    // type is a ReactNode, and can assume any value
    return code;
  }

  const content = (code.props as any)?.children;

  if (code.type !== 'code' || typeof content !== 'string') {
    // There is no need to transform an element that is not a code element or
    // a content that is not a string
    return code;
  }
  // Note that since we use `.split` we will have an extra entry
  // being an empty string, so we need to remove it
  const lines = content.split('\n');

  return (
    <code>
      {lines
        .flatMap((line, lineIndex) => {
          const columns = line.split(' ');

          return [
            <span key={lineIndex} className="line">
              {columns.map((column, columnIndex) => (
                <Fragment key={columnIndex}>
                  <span>{column}</span>
                  {columnIndex < columns.length - 1 && <span> </span>}
                </Fragment>
              ))}
            </span>,
            // Add a break line so the text content is formatted correctly
            // when copying to clipboard
            '\n',
          ];
        })
        // Here we remove that empty line from before and
        // the last flatMap entry which is an `\n`
        .slice(0, -2)}
    </code>
  );
};
export const TransformCodev2 = (content: any): ReactNode => {
  // Note that since we use `.split` we will have an extra entry
  // being an empty string, so we need to remove it

  content = content.children;
  if (typeof content !== 'string') {
    // There is no need to transform an element that is not a code element or
    // a content that is not a string
    return <></>;
  }
  const lines = content.split('\n') as string[];

  return (
    <code>
      {lines
        .flatMap((line, lineIndex) => {
          const columns = line.split(' ');

          return [
            <span key={lineIndex} className="line">
              {columns.map((column, columnIndex) => (
                <Fragment key={columnIndex}>
                  <span>{column}</span>
                  {columnIndex < columns.length - 1 && <span> </span>}
                </Fragment>
              ))}
            </span>,
            // Add a break line so the text content is formatted correctly
            // when copying to clipboard
            '\n',
          ];
        })
        // Here we remove that empty line from before and
        // the last flatMap entry which is an `\n`
        .slice(0, -2)}
    </code>
  );
};

type CodeBoxProps = {
  language: string;
  showCopyButton?: boolean;
  className?: string;
};

const CodeBox: FC<PropsWithChildren<CodeBoxProps>> = ({
  children,
  language,
  showCopyButton = true,
  className,
  ...rest
}) => {
  const ref = useRef<HTMLPreElement>(null);

  const [, copyToClipboard] = useCopyToClipboard();

  const onCopy = async () => {
    if (ref.current?.textContent) {
      copyToClipboard(ref.current.textContent);
    }
  };

  return (
    <div className={classNames(styles.root, 'not-prose')}>
      {language && <div className="border-b px-4 py-2 text-sm">{language}</div>}
      <pre
        ref={ref}
        className={classNames(styles.content, className)}
        tabIndex={0}
        dir="ltr"
      >
        {transformCode(children)}
      </pre>

      {/* {language && (
        <div className={classNames(styles.footer, 'dark:border-t-neutral-900')}>
          <span className={styles.language}>{language}</span>

          {showCopyButton && (
            <button
              className={classNames(styles.action, 'flex items-center gap-2')}
              onClick={onCopy}
            >
              <DocumentDuplicateIcon className={styles.icon} />
              Copy to clipboard
            </button>
          )}
        </div>
      )} */}
    </div>
  );
};
export const CodeBox2: FC<PropsWithChildren<any>> = (props) => {
  const ref = useRef<HTMLPreElement>(null);

  const [, copyToClipboard] = useCopyToClipboard();

  const onCopy = async () => {
    if (ref.current?.textContent) {
      copyToClipboard(ref.current.textContent);
    }
  };

  return (
    <div className={classNames(styles.root, 'not-prose')}>
      {props.language && (
        <div className="border-b px-4 py-2 text-sm">{props.language}</div>
      )}
      <pre
        ref={ref}
        className={classNames(styles.content, props.className)}
        tabIndex={0}
        dir="ltr"
      >
        {props.children}
      </pre>

      {/* {language && (
        <div className={classNames(styles.footer, 'dark:border-t-neutral-900')}>
          <span className={styles.language}>{language}</span>

          {showCopyButton && (
            <button
              className={classNames(styles.action, 'flex items-center gap-2')}
              onClick={onCopy}
            >
              <DocumentDuplicateIcon className={styles.icon} />
              Copy to clipboard
            </button>
          )}
        </div>
      )} */}
    </div>
  );
};

export default CodeBox;
