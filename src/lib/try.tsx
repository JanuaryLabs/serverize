import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';
import useCopyToClipboard from './code/useCopyToClipboard';

const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};
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
    <>
      <div className="flex flex-col md:flex-row items-center border rounded-md px-6 py-2 gap-x-4 relative">
        <span className="md:text-2xl text-lg font-medium">Try it now:</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              onClick={onCopy}
              className="flex gap-x-4 items-center transition rounded-lg hover:bg-gray-200 hover:text-black p-4"
            >
              <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
              <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
              <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
              <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />
              <div ref={ref} className="md:text-4xl text-2xl font-mono font-bold">
                npx serverize
              </div>
              <DocumentDuplicateIcon className="md:size-6 size-4" />
            </TooltipTrigger>
            <TooltipContent>Copy to clipboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
