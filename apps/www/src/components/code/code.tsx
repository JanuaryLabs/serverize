import type { FC, PropsWithChildren } from 'react';
import CodeBox from './index';

const MDXCodeBox: FC<PropsWithChildren<Record<string, any>>> = ({
  children: code,
  ...restoreFocus
}) => {
  return <CodeBox language={restoreFocus['data-language']}>{code}</CodeBox>;
};

export default MDXCodeBox;
