import { createServer } from 'http';
import { tmpdir } from 'os';
import type { Releases } from '@serverize/client';
// import sse from 'better-sse';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';

import { join } from 'path';
import {
  ProblemDetailsException,
  problemDetailsMiddleware,
} from 'rfc-7807-problem-details';
import { observeFile } from './file';

Object.assign(process.env, {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
});

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
  .get('/health', (req, res) => res.send('OK'));

application
  .use((req, res, next) => {
    // Not found handler
    if (!res.headersSent) {
      throw new ProblemDetailsException({
        status: 404,
        type: `${404}`,
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
      options.mapToStatusCode(Error, 500);
    }),
  );

const port = Number.parseInt(process.env.PORT || '3100', 10);
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
