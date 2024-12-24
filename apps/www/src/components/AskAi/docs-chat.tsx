import type { ReactNode } from 'react';
import { createContext } from 'react';

import { useAssistant, type Message } from 'ai/react';

export type GenerationStatus =
  | 'pending'
  | 'generating'
  | 'generated'
  | 'error'
  | 'idle';

// export interface Message {
//   role: 'user' | 'assistant';
//   content: ReactNode;
// }

export type ReadonlyMap<K, V> = Omit<Map<K, V>, 'set' | 'clear' | 'delete'>;
export const ChatContext = createContext<{
  messages: Message[];
  [key: string]: any;
}>({ messages: [] });

export function Chat(props: { children: ReactNode }) {
  const {
    status,
    messages,
    input,
    submitMessage,
    append,
    setInput,
    handleInputChange,
    stop,
    threadId,
    setThreadId,
  } = useAssistant({
    api: import.meta.env.DEV
      ? 'http://localhost:3000/ask'
      : 'https://serverize.fly.dev/ask',
  });

  return (
    <ChatContext.Provider
      value={{
        status,
        messages,
        input,
        submitMessage,
        handleInputChange,
        stop,
        setInput,
        append,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
}
