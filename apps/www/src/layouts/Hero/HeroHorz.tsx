import Try from '../../components/Box';
import Background from '../../components/background';
import { TextGenerateEffect } from '../../components/text-generate-effect';
import { Button, EyeCatchingButton } from '../../components/ui/button';
import type { PropsWithChildren } from 'react';

export default function HeroHorz(props: PropsWithChildren) {
  return (
    <Background>
      <div className="w-full max-w-2xl">
        <div className="flex w-full flex-col justify-center">
          <h1>
            <TextGenerateEffect
              filter={false}
              duration={1.5}
              words={'Make your development setup accessible worldwide'}
            />
          </h1>
          <h2 className="text-secondary-foreground mb-8 mt-8 md:text-xl">
            Serverize optimizes your development workflow by placing your
            development setup in the cloud, allowing for quick feedback,
            immediate testing, easy sharing, and smooth team collaboration.
            <strong>Deployment happens, but without the usual wait.</strong>
          </h2>
          <div className="items-start md:flex">
            <Try />
          </div>
          <div className="mt-4 text-sm font-semibold italic">
            This website is being Serverized
          </div>
          <div className="mt-8 flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
            <EyeCatchingButton>
              <a href="https://cal.com/january-sh/30min"> Request a demo </a>
            </EyeCatchingButton>
            <Button size={'lg'} variant={'outline'}>
              <a href="#integrations-section">Integrations</a>
            </Button>
          </div>
        </div>
      </div>
    </Background>
  );
}
