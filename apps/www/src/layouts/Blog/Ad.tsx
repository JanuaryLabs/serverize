import { BoomBox, CheckCircle2, Code, Rocket, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { cn } from '../../components/utils';

interface Feature {
  title: string;
  icon: React.ReactNode;
  description?: string;
}

interface Service {
  title: string;
  completed: boolean;
}

interface AdProps {
  projectName?: string;
  description?: string;
  products?: Feature[];
  services?: Service[];
  className?: string;
}

export default function Ad({
  className,
  projectName = 'JanuaryLabs',
  description = `Specialized API Development Agency`,
  // description = 'Next generation backend experience for developers',
  products = [
    {
      title: 'Serverize',
      description: 'One step docker deployment',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      title: 'January',
      description: 'Next generation backend experience',
      icon: <Code className="w-4 h-4" />,
    },
    {
      title: 'SDK-IT',
      description: 'SDK generation for your APIs',
      icon: <BoomBox className="w-4 h-4" />,
    },
  ],
  services = [
    { title: 'API Design & Architecture', completed: true },
    { title: 'Custom Integration Solutions', completed: true },
    { title: 'Deployment & Infrastructure', completed: true },
  ],
}: AdProps) {
  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div
        className={cn(
          'relative overflow-hidden',
          'bg-white dark:bg-zinc-900/90',
          'backdrop-blur-xl',
          'border border-zinc-200 dark:border-zinc-800/50',
          'rounded',
          'transition-all duration-300',
          'hover:shadow-xl hover:shadow-emerald-500/5',
          'hover:border-emerald-500/20',
        )}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-zinc-800">
                  <Rocket className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-lg font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {projectName}
                </h2>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                Our Products
              </h3>

              <TooltipProvider>
                <div className="grid grid-cols-3 gap-2">
                  {products.map((feature, index) => (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          key={feature.title}
                          className={cn(
                            'flex flex-col items-center justify-center',
                            'p-3 rounded-xl',
                            'bg-zinc-100/50 dark:bg-zinc-800/50',
                            'transition-colors duration-200',
                            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                          )}
                        >
                          <div className="text-emerald-500 mb-2">
                            {feature.icon}
                          </div>
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center">
                            {feature.title}
                          </span>
                          <TooltipContent>{feature.description}</TooltipContent>
                        </div>
                      </TooltipTrigger>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Services
              </h3>
              {services.map((service) => (
                <div
                  key={service.title}
                  className={cn(
                    'flex items-center',
                    'p-3 rounded-xl',
                    'bg-zinc-100/50 dark:bg-zinc-800/50',
                    'transition-colors duration-200',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full',
                        'flex items-center justify-center',
                        'bg-emerald-500/20 text-emerald-500',
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {service.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-col items-start text-center">
            <a
              href="https://cal.com/january-sh/30min"
              className={cn(
                'w-full py-2 px-4 hover:underline',
                'bg-emerald-500 hover:bg-emerald-600',
                'text-white font-medium',
                'rounded-lg',
                'transition-colors duration-300',
              )}
            >
              Hire Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
