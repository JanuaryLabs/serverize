import Background from '../../components/background';
import { TextGenerateEffect } from '../../components/text-generate-effect';
import Try from '../../components/try-command';
import { Button, EyeCatchingButton } from '../../components/ui/button';

export default function HeroVert() {
  return (
    <Background className="w-full lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-16 px-6 md:flex-row lg:gap-40 xl:px-0">
        <div className="flex w-full flex-1 flex-col justify-center">
          <h1 className="mb-8 font-sans md:font-mono">
            <TextGenerateEffect
              className="text-3xl font-bold lg:text-5xl"
              filter={false}
              duration={1.5}
              wordClassMap={{
                development: 'text-green-700',
                setup: 'underline tracking-widest',
                accessible: 'text-blue-600',
              }}
              words={'Make your development setup accessible worldwide'}
            />
          </h1>
          <div className="items-start md:flex">
            <Try />
          </div>
        </div>
        <div className="md:w-1/2">
          <h2 className="mb-8 text-secondary-foreground/70 lg:text-xl">
            Serverize your static website, API project, or full-stack
            application<span className="mx-1">-</span>
            <strong className="text-secondary-foreground">
              Give it a Dockerfile with a port and get a link that you can share
              with the world
            </strong>
            {/* Serverize optimizes your development workflow by placing your
            development setup in the cloud, allowing for quick feedback,
            immediate testing, easy sharing, and smooth team collaboration. */}
            {/* <br /> */}
            {/* <strong className="text-secondary-foreground pl-0.5 text-lg">
              Deployment happens, but without the usual wait.
            </strong> */}
          </h2>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <EyeCatchingButton className="lg:h-12 lg:text-lg" size={'lg'}>
              <a href="https://cal.com/january-sh/30min" target="_blank">
                Request a demo
              </a>
            </EyeCatchingButton>
            <Button
              size={'lg'}
              className="h-11 rounded-full px-12 shadow-none lg:h-12 lg:text-lg"
            >
              <a href="#integrations-section">Integrations</a>
            </Button>
          </div>
        </div>
      </div>
      {/* <TypewriterEffect
        className="mt-12"
        words={[
          { text: 'npx' },
          { text: 'serverize' },
          { text: 'deploy' },
          { text: '-p' },
          { text: 'project-winter', className: 'font-bold' },
        ]}
      /> */}
    </Background>
  );
}
