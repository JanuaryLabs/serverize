import { Releases } from '@serverize/client';
// import sse from 'better-sse';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { StatusCodes } from 'http-status-codes';
import morgan from 'morgan';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  ProblemDetailsException,
  problemDetailsMiddleware,
} from 'rfc-7807-problem-details';
import { catchError, filter, map, of, startWith, switchMap } from 'rxjs';
import { WebSocketServer } from 'ws';

import { getContainer, removeContainer } from 'serverize/docker';

import { observeFile } from './file';
import { type LogEntry, containerLogs, listenToDockerEvents } from './instance';
import { makeProjectPath } from './manager';
import { startServer } from './start';

Object.assign(process.env, {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
});

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

const application = express()
  .use(
    cors({
      origin: [
        /^https\:\/\/.*\.january\.sh$/,
        /^https\:\/\/.*\.serverize\.sh$/,
        /^http\:\/\/.*\localhost\:.*/,
      ],
      maxAge: 86400, // 1 day
    }),
  )
  .use(morgan('tiny'))
  .get('/health', (req, res) => res.send('OK'))
  .get('/logs', async (req, res) => {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      res.status(StatusCodes.UNAUTHORIZED).send();
      return;
    }
    const logLevel: 'verbose' | 'debug' | 'info' =
      process.env.NODE_ENV === 'development' ? 'verbose' : 'info';
    const repoPath = makeProjectPath(projectId);
    console.log({ projectId, repoPath });
    // const session = await sse.createSession(req, res);
    const runnerImageTag = 'makeImageName(projectId)';
    const runnerContainerName = projectId;
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
          containerLogs(runnerContainerName).pipe(
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
  })
  .post('/deploy', express.json(), async (req, res, next) => {
    try {
      const controller = new AbortController();
      const release = req.body as Releases & {
        projectName: string;
      };

      req.on('aborted', () => {
        console.log('Connection aborted');
        controller.abort('Client aborted connection');
      });

      const token = req.header('Authorization');
      if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      res.end();
      await startServer(
        token,
        controller.signal,
        {
          id: release.id,
          name: release.name,
          projectName: release.projectName,
          channel: release.channel,
          projectId: release.projectId,
          // TODO: create seperate entity for tarLocation, image and runtimeConfig (basically and column that will be updated later on not when the release is created)
          tarLocation: release.tarLocation!,
          image: release.image!,
          domainPrefix: release.domainPrefix,
          releaseId: release.id,
          volumes: release.volumes,
          traceId: req.body.traceId,
          environment: req.body.environment,
          serviceName: req.body.serviceName,
          network: req.body.network,
        },
        JSON.parse(release.runtimeConfig!),
      );
    } catch (error: any) {
      // TODO: log the error
      console.error(error);
      // res
      //   .status(StatusCodes.INTERNAL_SERVER_ERROR)
      //   .end(
      //     error instanceof Error
      //       ? `error:${error.message}`
      //       : 'error' in error
      //         ? `error:${error.error}`
      //         : 'error:unknown',
      //   );
    }
  })
  .post('/restart', express.json(), async (req, res, next) => {
    try {
      const controller = new AbortController();
      const release = req.body as Releases & {
        projectName: string;
      };
      req.on('aborted', () => {
        controller.abort('Client aborted connection');
      });

      const token = req.header('Authorization');
      if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      res.end();

      await startServer(
        token,
        controller.signal,
        {
          id: release.id,
          name: release.name,
          projectName: release.projectName,
          channel: release.channel,
          projectId: release.projectId,
          tarLocation: release.tarLocation!,
          image: release.image!,
          domainPrefix: release.domainPrefix,
          volumes: release.volumes,
          releaseId: release.id,
          traceId: req.body.traceId,
          environment: req.body.environment,
          serviceName: req.body.serviceName,
          network: req.body.network,
        },
        JSON.parse(release.runtimeConfig!),
      );
    } catch (error: any) {
      // TODO: log the error
      console.error(error);
      // res
      //   .status(StatusCodes.INTERNAL_SERVER_ERROR)
      //   .end(
      //     error instanceof Error
      //       ? `error:${error.message}`
      //       : 'error' in error
      //         ? `error:${error.error}`
      //         : 'error:unknown',
      //   );
    }
  })
  .get('/read', async (req, res) => {
    const controller = new AbortController();
    const signal = controller.signal;

    const traceId = req.query.traceId as string;
    const filePath = join(tmpdir(), traceId + '.jsonl');
    req.on('aborted', () => {
      controller.abort('Client aborted connection');
    });
    req.on('error', (error) => {
      if (error.name === 'AbortError') {
        return;
      }
      throw error;
    });

    await observeFile(
      filePath,
      res,
      AbortSignal.any([
        signal,
        AbortSignal.timeout(
          // 1 minute
          60 * 1000,
        ),
      ]),
    );
  })
  .delete('/terminate', async (req, res) => {
    const controller = new AbortController();
    const signal = controller.signal;

    req.on('aborted', () => {
      console.log('Connection closed');
      controller.abort('Client closed connection');
    });
    const token = req.header('Authorization');
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).send();
      return;
    }

    const xRelease = req.header('x-release');
    if (!xRelease) {
      res.status(StatusCodes.BAD_REQUEST).send();
      return;
    }

    const releaseInfo: {
      id: string;
      containerName: string;
    } = JSON.parse(Buffer.from(xRelease, 'base64').toString('utf-8'));

    const container = await getContainer({
      name: releaseInfo.containerName,
    });
    if (!container) {
      res.status(StatusCodes.BAD_REQUEST).send();
      return;
    }
    await removeContainer(container);

    res.json({});
  });

application
  .use((req, res, next) => {
    // Not found handler
    if (!res.headersSent) {
      throw new ProblemDetailsException({
        status: StatusCodes.NOT_FOUND,
        type: `${StatusCodes.NOT_FOUND}`,
        detail: "The requested resource couldn't be found.",
      });
    }
    next();
  })
  .use(
    // Error handler
    problemDetailsMiddleware.express((options) => {
      if (process.env['NODE_ENV'] === 'development') {
        options.rethrow(Error);
      }
      options.mapToStatusCode(Error, StatusCodes.INTERNAL_SERVER_ERROR);
    }),
  );

application
  .use((req, res, next) => {
    // Not found handler
    if (!res.headersSent) {
      throw new ProblemDetailsException({
        status: StatusCodes.NOT_FOUND,
        type: `${StatusCodes.NOT_FOUND}`,
        detail: "The requested resource couldn't be found.",
      });
    }
    next();
  })
  .use(
    // Error handler
    problemDetailsMiddleware.express((options) => {
      if (process.env['NODE_ENV'] === 'development') {
        options.rethrow(Error);
      }
      options.mapToStatusCode(Error, StatusCodes.INTERNAL_SERVER_ERROR);
    }),
  );

const port = parseInt(process.env.PORT || '3100', 10);
const server = createServer(application);

const wss = new WebSocketServer({ server });

// wss.on('connection', (client, req) => {
//   let logsSubscription: Subscription | null = null;
//   const recorder = createRecorder({
//     label: `websocket:${projectId}`,
//     verbose: true,
//   });
//   client.on('error', (error) => {
//     console.error(error);
//     recorder.end();
//   });
//   client.on('close', function () {
//     console.log('Connection closed', projectId);
//     recorder.end();
//   });
//   client.on('message', async (message) => {
//     const data = JSON.parse(message.toString()) as {
//       id: string;
//       command: string;
//       payload: Record<string, any>;
//     };
//     if (data.command === 'logs') {
//       recorder.record('logs');
//       const runnerContainerName = projectId;
//       if (data.payload.complete) {
//         logsSubscription?.unsubscribe();
//         return;
//       }

//       logsSubscription = listenToDockerEvents({
//         filters: {
//           container: [runnerContainerName],
//           type: ['container'],
//           event: ['start'],
//         },
//       })
//         .pipe(
//           startWith(data.payload.next ? 'anyvalue' : 'start'),
//           filter((action) => action !== 'anyvalue'),
//           switchMap(() =>
//             containerLogsRaw(runnerContainerName).pipe(
//               catchError((error) => {
//                 if (error instanceof ContainerNotFoundError) {
//                   return of(Buffer.from(''));
//                 }
//                 console.error(error);
//                 return of(Buffer.from('Error: Container not found'));
//               }),
//             ),
//           ),
//           takeUntil(once(client, 'close')),
//         )
//         .subscribe({
//           error: (error) => {
//             recorder.recordEnd('logs');
//             console.error(error);
//           },
//           complete: () => {
//             recorder.recordEnd('logs');
//           },
//           next: (chunk) => {
//             client.send(chunk);
//           },
//         });
//     }
//   });
// });

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
  wss.clients.forEach((client) => {
    client.terminate();
  });
  server.closeAllConnections();
  wss.close(() => {
    console.log('Websocket server closed');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  wss.clients.forEach((client) => {
    client.terminate();
  });
  server.closeAllConnections();
  wss.close(() => {
    console.log('Websocket server closed');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(error);
  process.exit(1);
});
