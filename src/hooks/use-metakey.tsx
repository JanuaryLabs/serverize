import { useEffect } from 'react';

export function useMetaKey(
  key: string,
  combinator: (event: KeyboardEvent) => boolean,
  handler: () => void,
) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === key && combinator(e)) {
        e.preventDefault();
        handler();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [key]);
}
