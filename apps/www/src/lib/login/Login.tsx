import { Separator } from '@radix-ui/react-separator';

import { Query } from '../../components/Query';
import { Button } from '../../components/ui/button';
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '../../components/ui/credenza';
import { Input } from '../../components/ui/input';
import { Card } from '../../layouts/Blog/BlogCard';
import { AuthButton } from './AuthButton';
import { useEffect, useState } from 'react';

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

export function Screen() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
        <div className="flex items-center">
          <a href="https://serverize.sh">Serverize</a>
        </div>
        <a target="_blank" href="https://serverize.sh/guides" rel="noreferrer">
          <button className="border-input hover:bg-accent focus-visible:ring-ring inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border px-4 py-2 text-xs font-medium shadow-sm transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
            Documentation
          </button>
        </a>
      </header>
      <div className="flex flex-1">
        <div className="bg-foreground/5 flex w-full max-w-2xl flex-col items-center justify-center space-y-8 p-8">
          <div className="w-[300px] space-y-4 text-center">
            <h2 className="font-regular text-4xl">Welcome!</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to your account
            </p>
          </div>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 w-[300px] border-spacing-0 items-center justify-center space-y-2 whitespace-nowrap rounded-md border-2 border-gray-700 px-4 py-4 text-sm font-medium shadow transition-colors hover:border-gray-500 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              version="1.1"
              x="0px"
              y="0px"
              viewBox="0 0 48 48"
              enableBackground="new 0 0 48 48"
              className="mr-2 h-4 w-4"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Continue with Google
          </button>
          <p className="text-muted-foreground w-[300px] max-w-sm text-center text-xs">
            By continuing, you agree to Serverize
            <a
              href="https://mem0.ai/privacy-policy"
              className="mx-0.5 underline"
            >
              Terms of Service
            </a>
            <span className="mx-0.5">and</span>
            <a
              href="https://mem0.ai/privacy-policy"
              className="mx-0.5 underline"
            >
              Privacy Policy
            </a>
            , and to receive periodic emails with updates.
          </p>
        </div>
        <div className="border-muted-foreground/20 hidden flex-1 items-center justify-center border-l p-8 lg:flex">
          <div className="max-w-md space-y-4">
            <div className="relative flex flex-col gap-6">
              <div className="z-10 max-w-lg text-3xl">
                Mem0 is a self-improving memory layer for LLM applications,
                enabling personalized AI experiences that save costs and delight
                users.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
