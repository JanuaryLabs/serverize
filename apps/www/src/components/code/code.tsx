import CodeBox from './index';
import type { FC, PropsWithChildren } from 'react';

const MDXCodeBox: FC<PropsWithChildren<Record<string, any>>> = ({
  children: code,
  ...restoreFocus
}) => {
  return <CodeBox language={restoreFocus['data-language']}>{code}</CodeBox>;
};

export default MDXCodeBox;
