import os from 'os';
import type { GetEventsOptions } from 'dockerode';

import { PassThrough } from 'stream';
import { docker, getContainer } from '@serverize/docker';
import {
  Observable,
  Subject,
  defer,
  from,
  map,
  merge,
  mergeMap,
  switchAll,
  switchMap,
  tap,
} from 'rxjs';
import tarStream from 'tar-stream';

export class ContainerNotFoundError extends Error {
  constructor(public containerId: string) {
    super(`Container ${containerId} not found`);
    Error.captureStackTrace(this, ContainerNotFoundError);
  }
}

export const INTERNAL_PORT = 3000;

export function listenToDockerEvents(
  options: Omit<GetEventsOptions, 'abortSignal'>,
) {
  const abortController = new AbortController();
  return new Observable<any>((subscriber) => {
    const events = docker.getEvents({
      abortSignal: abortController.signal,
      ...options,
    });

    from(events)
      .pipe(
        switchMap((x) => x),
        map((buffer) => {
          return (buffer.toString('utf-8') as string)
            .split('\n')
            .map((it) => it.trim())
            .filter(Boolean)
            .map((event) => {
              try {
                return JSON.parse(event);
              } catch (error) {
                console.error(
                  'Failed to parse event:',
                  event,
                  '$$$chunk$$',
                  buffer.toString('utf-8') as string,
                );
                if (process.env['NODE_ENV'] === 'development') {
                  // TODO: sometimes the buffer is too large so it doesn't get out
                  // as complete JSON object. we need to wait for the next chunk
                  // in order to parse it correctly.
                  throw error;
                }
                return {};
              }
            });
        }),
        switchAll(),
      )
      .subscribe(subscriber);

    return () => {
      abortController.abort();
      subscriber.unsubscribe();
    };
  });
}
export interface LogEntry {
  timestamp: string;
  log: string;
}

function timestampParser(text: string) {
  if (!text.includes('Z')) {
    return { timestamp: '', rest: text };
  }
  let timestamp = '';
  do {
    timestamp += text.slice(0, 1);
    text = text.slice(1);
  } while (text.slice(0, 1) !== 'Z');

  // repeat the last character
  timestamp += text.slice(0, 1);
  text = text.slice(1);

  return {
    timestamp: timestamp,
    rest: text,
  };
}

export function containerLogs(containerName: string) {
  return new Observable<LogEntry>((subscriber) => {
    const abortController = new AbortController();
    const container$ = defer(async () => {
      const container = await getContainer({ name: containerName });
      if (!container) {
        throw new ContainerNotFoundError(containerName);
      }
      return container;
    });
    const stream$ = container$.pipe(
      tap((container) => {
        console.log(
          'Listening to logs for container:',
          containerName,
          ` (${container.id})`,
        );
      }),
      switchMap((container) =>
        from(
          container.logs({
            // TODO: emit only from the start of the day
            follow: true,
            stdout: true,
            stderr: true,
            timestamps: true,
            details: true,
            abortSignal: abortController.signal,
          }),
        ).pipe(
          mergeMap((stream) => {
            // FIXME: keep the the weired chars, they are colors.
            const subject = new Subject<LogEntry>();
            const write$ = new PassThrough({
              write(chunk, encoding, callback) {
                const output = chunk.toString() as string;
                const lines = output.split('\n').map(timestampParser);
                lines.forEach((entry) =>
                  subject.next({ timestamp: entry.timestamp, log: entry.rest }),
                );
                callback();
              },
            });
            container.modem.demuxStream(stream, write$, write$);
            return subject;
          }),
        ),
      ),
    );

    stream$.subscribe(subscriber);

    return () => {
      console.log('ABORTING');
      abortController.abort();
      subscriber.unsubscribe();
    };
  });
}

export function containerLogsRaw(containerName: string) {
  return new Observable<any>((subscriber) => {
    const abortController = new AbortController();
    const container$ = defer(async () => {
      const container = await getContainer({ name: containerName });
      if (!container) {
        throw new ContainerNotFoundError(containerName);
      }
      return container;
    });
    const stream$ = container$.pipe(
      tap((container) => {
        console.log(
          'Listening to logs for container:',
          containerName,
          ` (${container.id})`,
        );
      }),
      switchMap((container) =>
        from(
          container.logs({
            // TODO: emit only from the start of the day
            follow: true,
            stdout: true,
            stderr: true,
            timestamps: false,
            details: true,
            abortSignal: abortController.signal,
          }),
        ).pipe(
          mergeMap((stream) => {
            const stdout = new PassThrough();
            const stderr = new PassThrough();
            const pass = merge(stdout, stderr);
            container.modem.demuxStream(stream, stdout, stderr);
            return pass;
          }),
        ),
      ),
    );

    stream$.subscribe(subscriber);

    return () => {
      console.log('ABORTING');
      abortController.abort();
      subscriber.unsubscribe();
    };
  });
}

function calculateNContainerPerMachine(memoryPerContainerMB = 96) {
  const totalMemoryMB = os.totalmem() / (1024 * 1024);
  const totalCPUs = os.cpus().length;
  const numberOfContainers = Math.floor(totalMemoryMB / memoryPerContainerMB);
  const cpuPeriod = 100000; // 100ms (default in Docker)
  const cpuQuota = Math.floor((cpuPeriod * totalCPUs) / numberOfContainers);

  console.log({
    totalMemoryMB,
    totalCPUs,
    memoryPerContainerMB,
    numberOfContainers,
    cpuPeriod,
    cpuQuota,
  });

  console.log({
    Memory: memoryPerContainerMB * 1024 * 1024, // Convert MB to bytes
    MemorySwap: memoryPerContainerMB * 4 * 1024 * 1024, // Four times the memory
    CpuPeriod: cpuPeriod,
    CpuQuota: cpuQuota,
  });
}

export function createTar(files: { content: string; path: string }[]) {
  const pack = tarStream.pack();
  for (const { path, content } of files) {
    pack.entry({ name: path }, content);
  }
  pack.finalize();
  return pack;
}
