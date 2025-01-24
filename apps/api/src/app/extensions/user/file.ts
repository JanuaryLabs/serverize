import { createReadStream } from 'fs';
import { stat, watch } from 'fs/promises';

import { createInterface } from 'readline';
import { Readable } from 'stream';

function readJsonl(
  filePath: string,
  options: {
    signal: AbortSignal;
    start?: number;
    end?: number;
  },
) {
  return createInterface({
    input: createReadStream(filePath, {
      signal: options.signal,
      flags: 'r',
      encoding: 'utf-8',
      start: options.start,
      end: options.end,
    }),
    terminal: false,
    crlfDelay: Infinity,
  });
}

export function observeFile(config: {
  filePath: string;
  signal: AbortSignal;
  autoRestart?: boolean;
}) {
  const readable = new Readable({
    objectMode: false,
    encoding: 'utf-8',
    read() {},
    signal: config.signal,
  });
  (async () => {
    const stream = readJsonl(config.filePath, {
      signal: config.signal,
    });

    // keep it blocking because we don't want to start the watch until the current content is sent
    for await (const line of stream) {
      await write(line);
    }

    // Get the current size of the file
    let lastSize = await stat(config.filePath).then((it) => it.size);

    for await (const _ of watch(config.filePath, {
      persistent: true,
      recursive: false,
      signal: config.signal,
    })) {
      lastSize = await read(lastSize);
    }

    async function read(start: number) {
      const currentSize = await stat(config.filePath).then((it) => it.size);
      if (currentSize > start) {
        const end = currentSize - 1;
        const stream = readJsonl(config.filePath, {
          signal: config.signal,
          start,
          end,
        });
        for await (const chunk of stream) {
          await write(chunk);
        }
      } else if (config.autoRestart) {
        lastSize = await read(0);
      }
      return currentSize;
    }
    async function write(line: string) {
      if (!readable.push(line)) {
        await new Promise((resolve) => readable.once('drain', resolve));
      }
    }
  })();

  return readable;
}
