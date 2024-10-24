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

export default function Try() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [, copyToClipboard] = useCopyToClipboard();

  const onCopy = async () => {
    console.log(ref.current?.textContent);
    if (ref.current?.textContent) {
      copyToClipboard(ref.current.textContent);
    }
  };
  return (
    <Box className="lg:pr-3 md:gap-x-2 lg:pl-4 pr-2 pl-3 py-1 flex flex-col md:flex-row md:items-baseline items-center">
      <TooltipProvider>
        <span className="lg:text-xl font-medium">Try it now:</span>
        <Tooltip delayDuration={0}>
          <TooltipTrigger
            onClick={onCopy}
            className="flex lg:gap-x-4 md:ml-auto gap-x-2 md:items-baseline items-center transition rounded-lg hover:bg-gray-200 hover:text-black py-2 lg:p-4 lg:py-4"
          >
            <div
              ref={ref}
              className="lg:text-2xl text-xl font-mono font-semibold"
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
