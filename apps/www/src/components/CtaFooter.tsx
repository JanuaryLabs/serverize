import Cta from './Cta';
import Footer from './Footer';
import { GridBackgroundDemo } from './background';
import { Separator } from './ui/separator';
import { cn } from './utils';

export default function CtaFooter() {
  return (
    <GridBackgroundDemo className="w-full">
      <Separator />
      <div className="z-10 flex w-full flex-col items-center">
        <div className="mx-auto flex h-full w-full flex-col items-center justify-center gap-8 py-16">
          <div className="relative flex w-full flex-col items-start justify-center gap-4">
            <div className="mx-auto max-w-6xl space-y-16 md:space-y-28">
              <Cta />
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </GridBackgroundDemo>
  );
}
