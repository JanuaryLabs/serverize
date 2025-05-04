import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useContext } from 'react';
import { ChatContext } from './docs-chat';

export function PromptForm(props: { className?: string }) {
  const { status, messages, input, submitMessage, handleInputChange, stop } =
    useContext(ChatContext);

  return (
    <form
      onSubmit={submitMessage}
      className="flex items-center justify-between"
    >
      <Input
        onChange={handleInputChange}
        value={input}
        placeholder="What's your question?"
        className="h-14 w-full border-0 px-4 text-base shadow-none focus-visible:ring-0"
      />
      {status === 'in_progress' ? (
        <Button
          variant={'ghost'}
          size={'icon'}
          type="button"
          className="mx-4"
          onClick={stop}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
            />
          </svg>
        </Button>
      ) : (
        <Button variant={'ghost'} size={'icon'} type="submit" className="mx-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M16.25 3a.75.75 0 0 0-.75.75v7.5H4.56l1.97-1.97a.75.75 0 0 0-1.06-1.06l-3.25 3.25a.75.75 0 0 0 0 1.06l3.25 3.25a.75.75 0 0 0 1.06-1.06l-1.97-1.97h11.69A.75.75 0 0 0 17 12V3.75a.75.75 0 0 0-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      )}
    </form>
  );
}
