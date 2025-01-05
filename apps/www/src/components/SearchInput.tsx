import { cn } from './utils';

export default function SearchInput(props: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-secondary text-secondary-foreground/70 flex min-w-56 cursor-text items-center justify-between gap-x-2 rounded-2xl px-2 py-2 text-sm',
        props.className,
      )}
    >
      <div className="flex items-center gap-x-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
          />
        </svg>

        <span>Ask AI</span>
      </div>
      <kbd className="dark:bg-background text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-2 text-[10px] font-medium">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}
