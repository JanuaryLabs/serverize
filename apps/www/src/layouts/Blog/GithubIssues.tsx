// Mostly auto generated: https://v0.dev/chat/list-03-j3fSTIMT6aE?b=b_gPWbSK1fCfx&p=0

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import {
  CheckCircle2,
  Circle,
  Clock,
  GitPullRequest,
  Star,
} from 'lucide-react';
import { cn } from '../../components/utils';

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  closed_at?: string;
  labels: { name: string }[];
  reactions: {
    total_count: number;
    '+1': number;
    stars?: number;
  };
}

export function Issues() {
  const closedIssues = useQuery<any[]>({
    queryKey: ['issues'],
    // 6 hours
    refetchInterval: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const closedResponse = await fetch(
        'https://api.github.com/repos/JanuaryLabs/serverize/issues?state=closed&sort=updated&direction=desc&per_page=2',
      );
      return await closedResponse.json();
    },
  });
  const starredIssues = useQuery<any[]>({
    queryKey: ['issues'],
    // 6 hours
    refetchInterval: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const openResponse = await fetch(
        'https://api.github.com/repos/JanuaryLabs/serverize/issues?state=open&sort=reactions&direction=desc&per_page=3',
      );
      return await openResponse.json();
    },
  });

  return (
    <div
      className={cn(
        'w-full max-w-md mx-auto',
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-800',
        'rounded-lg',
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            JanuaryLabs/serverize
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            GitHub Issues
          </p>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {closedIssues.isPending ? (
          <div className="p-4 text-center text-zinc-500">Loading issues...</div>
        ) : (
          <>
            <div className="p-3">
              <h3 className="text-sm font-medium text-zinc-500 mb-2">
                Recently Closed
              </h3>
              {(closedIssues.data ?? []).map((issue) => (
                <div
                  key={issue.number}
                  className="flex items-center gap-3 group mb-2"
                >
                  <div className="flex-none">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs text-zinc-500">
                        {new Date(issue.closed_at || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">#{issue.number}</span>
                </div>
              ))}
            </div>

            <div className="p-3">
              <h3 className="text-sm font-medium text-zinc-500 mb-2">
                Most Starred Features
              </h3>
              {(starredIssues.data ?? []).map((issue) => (
                <div
                  key={issue.number}
                  className="flex items-center gap-3 group mb-3"
                >
                  <div className="flex-none">
                    <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">
                        {issue.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        <GitPullRequest className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs text-zinc-500">
                          #{issue.number}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-zinc-500">
                          {issue.reactions?.total_count || 0}
                        </span>
                      </div>
                      {((issue.labels ?? []) as any[]).map((label) => (
                        <span
                          key={label.name}
                          className="text-xs px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium"
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function GitHubIssues() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Issues />
    </QueryClientProvider>
  );
}
