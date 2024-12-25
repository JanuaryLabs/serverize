import { EventSource } from 'eventsource';
import fetch from 'node-fetch';
import { createInterface } from 'readline';
import { Observable, from, switchMap } from 'rxjs';
import { WebSocket } from 'ws';

import { safeFail } from 'serverize/utils';

import {
  serverizeManagementUrl,
  serverizeManagementWs,
} from './lib/api-client';
import { logger } from './program';

export function followLogs(next?: boolean) {
  const ws = new WebSocket(`${serverizeManagementWs}?apiKey=`);
  ws.on('open', () => {
    logger('Connected to runner server');
    ws.send(
      JSON.stringify({
        command: 'logs',
        payload: {
          next: next ?? true,
        },
      }),
    );
  });

  ws.on('message', (data) => {
    logger('Received message from runner server');
    console.log(data.toString());
  });

  ws.on('close', () => {
    logger('Disconnected from source server');
    // in case serverize closes the connection we need to exit
    // otherwise the process will keep running for nothing
    // TODO: implement retry logic or use rxjs/websocket
    process.exit(0);
  });
}

export function toBase64(data: any) {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function sse(token: string) {
  return new Observable<string>((subscriber) => {
    const eventSource = new EventSource(`${serverizeManagementUrl}/progress`, {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: token,
          },
        }) as any,
    });
    eventSource.onmessage = (event) => {
      const payload = safeFail(() => JSON.parse(event.data as any), {
        message: '',
      });
      if (payload.type === 'error') {
        subscriber.error(payload.message);
      } else if (payload.type === 'complete') {
        subscriber.next(payload.message);
        subscriber.complete();
        eventSource.close();
      } else if (payload.type === 'logs') {
        process.stdout.write(payload.message);
      } else {
        subscriber.next(payload.message);
      }
    };
    eventSource.onerror = (error) => {
      console.log(error);
      subscriber.error(error.message);
    };

    return () => {
      eventSource.close();
    };
  });
}

export function streamLogs(logId: string) {
  return new Observable<string>((subscriber) => {
    const controller = new AbortController();
    from(
      fetch(`${serverizeManagementUrl}/read?traceId=${logId}`, {
        method: 'GET',
        signal: controller.signal,
      }),
    )
      .pipe(
        switchMap((response) =>
          createInterface({
            input: response.body!,
            crlfDelay: Infinity,
            terminal: false,
          }),
        ),
      )
      .subscribe((data) => {
        const payload = safeFail(() => JSON.parse(data), { message: '' });
        if (payload.type === 'error') {
          subscriber.error(payload.message);
        } else if (payload.type === 'complete') {
          subscriber.next(payload.message);
          subscriber.complete();
        } else if (payload.type === 'logs') {
          process.stdout.write(payload.message);
        } else {
          subscriber.next(payload.message);
        }
      });

    return () => {
      controller.abort();
    };
  });
}
