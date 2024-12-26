// import sse from 'better-sse';
import { catchError, filter, map, of, startWith, switchMap } from 'rxjs';

import { type LogEntry, containerLogs, listenToDockerEvents } from './instance';

const eventMessages: Record<string, string | ((event: any) => string)> = {
  create: 'Container created. Starting logs...',
  destroy: 'Container destroyed. Stopping logs...',
  start: 'Container started. Attaching logs...',
  stop: 'Container stopped.',
  die: 'Container stopped unexpectedly.',
  restart: 'Container restarted. Reattaching logs...',
  kill: 'Container killed.',
  exec_create: (event: { status: string }) =>
    event.status.replace('exec_create: ', 'Command created: '),
  exec_start: (event: { status: string }) =>
    event.status.replace('exec_start: ', 'Executing: '),
  exec_detach: (event: { status: string }) =>
    event.status.replace('exec_detach: ', 'Command detached: '),
  exec_die: 'Command finished.',
  health_status: (event: { status: string }) =>
    event.status.replace('health_status: ', 'Health check: '),
};

export async function containerPrettyLogging(containerName: string) {
  const logLevel: 'verbose' | 'debug' | 'info' =
    process.env.NODE_ENV === 'development' ? 'verbose' : 'info';
  // const session = await sse.createSession(req, res);
  const runnerImageTag = 'makeImageName(projectId)';
  // it is okay even if the container is dead (DON'T START IT)
  // const container = await getContainer({ name: runnerContainerName });
  // if (!container) {
  //   try {
  //     await startContainer(projectId);
  //   } catch (error: any) {
  //     session.push({
  //       error: error?.message ?? 'Serverize error',
  //       isLogEntry: false,
  //     });
  //     res.end();
  //     return;
  //   }
  // }

  const containersEvents$ = listenToDockerEvents({
    filters: {
      type: ['container'],
    },
  }).pipe(filter((event) => event.from === runnerImageTag));

  const dockerEventsSubscriber = containersEvents$
    // .pipe(filter(() => logLevel === 'verbose'))
    .subscribe((events) => {
      for (const event of events) {
        const action = event.Action.split(':').shift();
        const message = eventMessages[action];
        const logEntry: LogEntry = {
          log: !message
            ? `Unknown event: ${event.Action}`
            : typeof message === 'function'
              ? message(event)
              : message,
          timestamp: String(event.timeNano || event.time || ''),
          // to convert to JS Date new Date(timeNano / 1000000).toIsoString()
        };
        // session.push(logEntry);
      }
    });

  const containerLogsSubscriber = containersEvents$
    .pipe(
      map((event) => event.Action),
      startWith('start'),
      filter((action) => action === 'start'),
      switchMap(() =>
        containerLogs(containerName).pipe(
          catchError((error) =>
            of({ error: error.message, isLogEntry: false }),
          ),
        ),
      ),
    )
    .subscribe((data) => {
      // session.push(data);
    });

  // session.on('disconnected', () => {
  //   console.log('disconnected');
  //   dockerEventsSubscriber.unsubscribe();
  //   containerLogsSubscriber.unsubscribe();
  // });
}
