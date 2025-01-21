import { Activity, Flame, Heart, Timer } from 'lucide-react';
import type { JSX } from 'react';
import { cn } from '../../components/utils';

const colorVariants = {
  rose: 'text-rose-500',
  green: 'text-green-500',
  blue: 'text-blue-500',
} as const;

const bgColorVariants = {
  rose: 'bg-rose-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
} as const;

interface Card05Props {
  metrics?: {
    label: string;
    value: string;
    icon: JSX.Element;
    color: keyof typeof colorVariants;
    progress: number;
  }[];
  goals?: {
    title: string;
    progress: number;
    color: keyof typeof colorVariants;
  }[];
}

export default function Stats({
  metrics = [
    {
      label: 'Move',
      value: '486',
      icon: <Flame className="w-4 h-4" />,
      color: 'rose',
      progress: 85,
    },
    {
      label: 'Exercise',
      value: '48',
      icon: <Timer className="w-4 h-4" />,
      color: 'green',
      progress: 92,
    },
    {
      label: 'Heart',
      value: '72',
      icon: <Heart className="w-4 h-4" />,
      color: 'blue',
      progress: 78,
    },
  ],
  goals = [
    { title: 'Daily Move Goal', progress: 85, color: 'rose' },
    { title: 'Exercise Time', progress: 92, color: 'green' },
    { title: 'Stand Hours', progress: 75, color: 'blue' },
  ],
}: Card05Props) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className={cn(
          'relative overflow-hidden',
          'bg-white dark:bg-black',
          'rounded-lg',
          'transition-all duration-300',
          'hover:shadow-2xl',
          'hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/30',
          'border border-zinc-200 dark:border-zinc-800',
        )}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className={cn(
                'p-2.5 rounded-2xl',
                'bg-zinc-100 dark:bg-zinc-800',
                'ring-1',
                'ring-zinc-200 dark:ring-white/10',
              )}
            >
              <Activity className="w-5 h-5 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                Activity
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Today's Progress
              </p>
            </div>
          </div>

          {/* Metrics Rings */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="relative flex flex-col items-center"
              >
                <div className="relative w-20 h-20 mb-3">
                  {/* Background Ring */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full',
                      'border-[3px]',
                      'border-zinc-100 dark:border-zinc-800',
                    )}
                  />

                  {/* Progress Ring */}
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      className={cn(
                        colorVariants[metric.color],
                        'stroke-current',
                        'transition-all duration-500',
                      )}
                      cx="50"
                      cy="50"
                      r="48"
                      fill="none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${metric.progress * 3}, 1000`}
                    />
                  </svg>

                  {/* Center Content */}
                  <div
                    className={cn(
                      'absolute inset-0',
                      'flex flex-col items-center justify-center',
                      'text-zinc-900 dark:text-white',
                    )}
                  >
                    <span className="text-xl font-semibold">
                      {metric.value}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1.5',
                    'px-3 py-1.5 rounded-xl',
                    'bg-zinc-100/80 dark:bg-zinc-800/50',
                    'ring-1',
                    'ring-zinc-200 dark:ring-white/10',
                    'backdrop-blur-sm',
                  )}
                >
                  <div className={colorVariants[metric.color]}>
                    {metric.icon}
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    {metric.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Goals Progress */}
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.title} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {goal.title}
                  </span>
                  <span className="text-zinc-900 dark:text-white">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      bgColorVariants[goal.color],
                      'transition-all duration-500',
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Glossy Overlay */}
        <div
          className={cn(
            'absolute inset-0',
            'pointer-events-none',
            'bg-gradient-to-br',
            'from-white/10 to-transparent dark:from-white/5 dark:to-transparent',
            'rounded-[2.5rem]',
          )}
        />
      </div>
    </div>
  );
}
