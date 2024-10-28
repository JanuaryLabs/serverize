import { Button } from '@/components/ui/button';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useState, type PropsWithChildren } from 'react';
import { useMetaKey } from '../../hooks/use-metakey';
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '../ui/credenza';
import { Separator } from '../ui/separator';
import { Chat } from './docs-chat';
import { ChatList } from './docs-chatlist';
import { PromptForm } from './PromptForm';

export default function AskAiBox(props: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  useMetaKey(
    'k',
    (e) => e.metaKey || e.ctrlKey,
    () => setOpen((open) => !open),
  );
  return (
    // <Dialog modal={true} open={open} onOpenChange={setOpen}>
    //   <DialogTrigger>{props.children}</DialogTrigger>
    //   <DialogContent className="gap-0 p-0 sm:max-w-xl xl:max-w-2xl [&>button]:hidden">
    //     <VisuallyHidden.Root>
    //       <DialogHeader>
    //         <DialogTitle></DialogTitle>
    //         <DialogDescription></DialogDescription>
    //       </DialogHeader>
    //     </VisuallyHidden.Root>

    //     <Chat>
    //       <PromptForm />
    //       <Separator />
    //       <div className="flex h-full max-h-96 flex-col overflow-auto px-8">
    //         <div className="mb-4 mt-4 flex h-full flex-col items-start">
    //           <ChatList>
    //             <SuggestedPrompts />
    //           </ChatList>
    //         </div>
    //       </div>
    //     </Chat>
    //   </DialogContent>
    // </Dialog>
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{props.children}</CredenzaTrigger>
      <CredenzaContent className="gap-0 p-0 sm:max-w-xl xl:max-w-2xl [&>button]:hidden">
        <VisuallyHidden.Root>
          <CredenzaHeader>
            <CredenzaTitle></CredenzaTitle>
            <CredenzaDescription></CredenzaDescription>
          </CredenzaHeader>
        </VisuallyHidden.Root>
        <CredenzaBody>
          <Chat>
            <PromptForm />
            <Separator />
            <div className="flex h-full max-h-[calc(100vh-10rem)] flex-col overflow-auto px-8 lg:max-h-[calc(100vh-15rem)]">
              <div className="mb-4 mt-4 flex h-full flex-col items-start">
                <ChatList />
              </div>
            </div>
          </Chat>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
