import Background from '../../components/background';
import Try from '../../components/try-command';
import { TextGenerateEffect } from '../../components/text-generate-effect';
import { EyeCatchingButton, Button } from '../../components/ui/button';

export default function HeroVert() {
  return (
    <Background className="max-w-7xl mx-auto">
      <div className="w-full flex justify-between md:flex-row flex-col items-center lg:gap-40 gap-16">
        <div className="w-full flex justify-center flex-col flex-1">
          <h1 className="mb-8 md:font-['Crimson_Text'] font-sans">
            <TextGenerateEffect
              className="lg:text-5xl text-3xl font-bold"
              filter={false}
              duration={1.5}
              words={'Make your development setup accessible worldwide'}
            />
          </h1>
          <div className="md:flex items-start">
            <Try />
          </div>

          {/* <i className="text-xs mt-4">
            Serverize your static website, API project, or full-stack
            application -
            <strong>
              Give it a Dockerfile with a port and get a link that you can share
              with the world
            </strong>
          </i> */}
        </div>
        <div className="md:w-1/2">
          <h2 className="lg:text-xl mb-8 text-secondary-foreground/70">
            Serverize your static website, API project, or full-stack
            application<span className="mx-1">-</span>
            <strong>
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

          <div className="mt-8 md:gap-8 gap-4 flex md:flex-row flex-col md:items-center">
            <EyeCatchingButton className="lg:text-lg lg:h-12" size={'lg'}>
              <a href="https://cal.com/january-sh/30min" target="_blank">
                Request a demo
              </a>
            </EyeCatchingButton>
            <Button
              size={'lg'}
              className="rounded-full shadow-none lg:text-lg lg:h-12 h-11 px-12"
            >
              <a href="#integrations-section">Integrations</a>
            </Button>
          </div>
        </div>
      </div>
    </Background>
  );
}
