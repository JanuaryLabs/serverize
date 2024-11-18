import { Separator } from '@radix-ui/react-separator';
import { Query } from '../../components/Query';
import { Button } from '../../components/ui/button';
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
} from '../../components/ui/credenza';
import { Input } from '../../components/ui/input';
import { AuthButton } from './AuthButton';
import { useEffect, useState } from 'react';
import { Card } from '../../layouts/Blog/BlogCard';

export default function Login() {
  const [dialogOpen, setDialogOpen] = useState<boolean | null>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubUrl = params.get('import');
    if (githubUrl) {
      setDialogOpen(true);
    }
  }, []);

  return (
    <Query>
      <div className="mx-auto max-w-xl">
        <AuthButton />
      </div>
      <Credenza open={!!dialogOpen} onOpenChange={setDialogOpen}>
        <CredenzaTrigger asChild></CredenzaTrigger>
        <CredenzaContent className="bg-white">
          <CredenzaHeader>
            <CredenzaTitle>
              Join <span className="text-red-800">January</span> beta waitlist
            </CredenzaTitle>
            <CredenzaDescription>
              Efficient Backend Development with Complete Code Control.
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody>
            <p className="mb-4 text-sm">
              Sign up to be one of the first to try January. We&apos;re opening
              up spots gradually.
            </p>
            <div className="flex flex-col items-start gap-y-2">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  //   await joinMutate.mutateAsync('email');
                }}
                className="flex w-full items-center gap-x-2"
              >
                <Input
                  type="email"
                  //   onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-500"
                  placeholder="Email address"
                />
                <Button
                  //   disabled={joinMutate.isPending}
                  type="submit"
                  //   variant={'shine'}
                >
                  {/* {joinMutate.isPending && (
                    <VscLoading className="mr-1 h-3 w-3 animate-spin" />
                  )} */}
                  Join waitlist
                </Button>
              </form>
            </div>

            <div className="mb-4 md:mb-0"> </div>
          </CredenzaBody>
          <Card>
            <p className="text-sm">
              <Button
                variant={'ghost'}
                className="hover:bg-transparent hover:underline"
              >
                <a
                  href="https://cal.com/january-sh/30min"
                  target="_blank"
                  rel="noreferrer"
                >
                  Book a <span className="underline">demo</span> and let&apos;s
                  build your product together.
                </a>
              </Button>
            </p>
          </Card>
        </CredenzaContent>
      </Credenza>
    </Query>
  );
}
