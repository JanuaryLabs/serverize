import { Terminal } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { PropsWithChildren } from 'react';

export default function Note(
  props: PropsWithChildren<{ variant?: 'warning' | 'info' }>,
) {
  return (
    <Alert variant={props.variant === 'warning' ? 'destructive' : 'default'}>
      <Terminal className="h-4 w-4" />
      <AlertTitle>
        {props.variant === 'warning' ? 'Warning' : 'Info'}
      </AlertTitle>
      <AlertDescription>{props.children}</AlertDescription>
    </Alert>
  );
}
