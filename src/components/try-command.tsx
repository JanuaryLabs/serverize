import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';
import Box from './Box';
import useCopyToClipboard from './code/useCopyToClipboard';
import { cn } from './utils';

export default function Try(props: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [, copyToClipboard] = useCopyToClipboard();

  const onCopy = async () => {
    if (ref.current?.textContent) {
      copyToClipboard(ref.current.textContent);
    }
  };
  return (
    <Box
      className={cn(
        'flex flex-col items-center py-1 pl-3 pr-2 md:flex-row md:items-baseline md:gap-x-2 lg:pl-4 lg:pr-3',
        props.className,
      )}
    >
      <TooltipProvider>
        <span className="font-medium lg:text-xl">Try it now:</span>
        <Tooltip delayDuration={0}>
          <TooltipTrigger
            onClick={onCopy}
            className="flex items-center gap-x-2 rounded-lg py-2 transition hover:bg-gray-200 hover:text-black md:ml-auto md:items-baseline lg:gap-x-4 lg:p-4 lg:py-4"
          >
            <div
              ref={ref}
              className="font-mono text-xl font-semibold lg:text-2xl"
            >
              npx serverize
            </div>
            <DocumentDuplicateIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Box>
  );
}
