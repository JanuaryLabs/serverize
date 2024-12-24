import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '../ui/button';
import { ChatContext } from './docs-chat';
import { AssistantMessage, UserMessage } from './docs-messages';
import type { Message } from 'ai/react';

export function ChatList(props: PropsWithChildren) {
  const { messages, submitMessage, append, setInput } = useContext(ChatContext);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollEl = useMemo(() => {
    return document.querySelector(
      '.chat-scroll [data-radix-scroll-area-viewport]',
    );
  }, []);
  const scrollingToBottom = useCallback(() => {
    if (!scrollEl) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollEl;
    return scrollHeight - scrollTop === clientHeight;
  }, [scrollEl]);

  const debounced = useDebouncedCallback<(el: Element) => void>(
    () => () => {
      setAutoScroll(scrollingToBottom());
    },
    50,
  );
  useEffect(() => {
    const handler = () => {
      if (scrollingToBottom()) {
        setAutoScroll(true);
      } else {
        debounced(scrollEl!);
      }
    };
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handler);
    }
    return () => scrollEl?.removeEventListener('scroll', handler);
  }, [debounced, scrollEl, scrollingToBottom]);

  useEffect(() => {
    setTimeout(() => {
      const chat = document.querySelector('#chat-content');
      if (chat) {
        chat.scrollIntoView({
          behavior: 'instant',
          block: 'end',
          inline: 'end',
        });
      }
    });
  }, []);
  useEffect(() => {
    const chat = document.querySelector('#chat-content');
    if (chat) {
      chat.scrollIntoView({ behavior: 'instant', block: 'end', inline: 'end' });
    }
  }, [messages]);
  return (
    <>
      {messages.length === 0 && (
        <SuggestedPrompts
          onSelectPrompt={(prompt) => {
            append({
              id: crypto.randomUUID(),
              role: 'user',
              content: prompt,
            } satisfies Message);
          }}
        />
      )}
      <div
        id="chat-content"
        className="prose text-sm prose-p:my-4 prose-ol:my-4"
      >
        {messages.map((it) => (
          <React.Fragment key={it.id}>
            {it.role === 'user' ? (
              <UserMessage message={it.content} />
            ) : (
              <AssistantMessage message={it.content} />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function SuggestedPrompts(props: { onSelectPrompt: (prompt: string) => void }) {
  return (
    <>
      <div className="mb-4 flex flex-col items-start">
        <p className="my-4 text-sm text-secondary-foreground/70">
          Hi! I'm an AI assistant trained on documentation, code, and other
          content. I can answer questions about{' '}
          <strong className="text-foreground">Serverize</strong>, what's on your
          mind?
        </p>
        <p className="mb-4 text-xs text-secondary-foreground/70">
          Suggested Prompts
        </p>
        <ul className="flex flex-col items-start gap-y-2">
          {[
            'How to store secrets?',
            'I want Dockerfile for laravel project',
            'Connect postgreSQL to node.js',
            'How much does it cost to deploy a project?',
            'What is SHAZAM?',
          ].map((it) => (
            <Button
              key={it}
              onClick={() => props.onSelectPrompt(it)}
              className="border"
              variant={'secondary'}
            >
              {it}
            </Button>
          ))}
        </ul>
      </div>
    </>
  );
}
