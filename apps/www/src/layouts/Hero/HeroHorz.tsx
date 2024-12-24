import type { PropsWithChildren } from 'react';
import Background from '../../components/background';
import Try from '../../components/Box';
import { TextGenerateEffect } from '../../components/text-generate-effect';
import { EyeCatchingButton, Button } from '../../components/ui/button';

export default function HeroHorz(props: PropsWithChildren) {
  return (
    <Background>
      <div className="max-w-2xl w-full">
        <div className="w-full flex justify-center flex-col">
          <h1>
            <TextGenerateEffect
              filter={false}
              duration={1.5}
              words={'Make your development setup accessible worldwide'}
            />
          </h1>
          <h2 className="md:text-xl mt-8 mb-8 text-secondary-foreground">
            Serverize optimizes your development workflow by placing your
            development setup in the cloud, allowing for quick feedback,
            immediate testing, easy sharing, and smooth team collaboration.
            <strong>Deployment happens, but without the usual wait.</strong>
          </h2>
          <div className="md:flex items-start">
            <Try />
          </div>
          <div className="italic text-sm mt-4 font-semibold">
            This website is being Serverized
          </div>
          <div className="mt-8 lg:gap-8 gap-4 flex lg:flex-row flex-col items-center">
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
