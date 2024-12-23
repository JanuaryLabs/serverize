import {
  closeSync,
  createReadStream,
  createWriteStream,
  openSync,
  readSync,
  statSync,
} from 'fs';
import { stat, watch } from 'fs/promises';
import { createInterface } from 'readline';
import { type Writable } from 'stream';

export function fileWriter<T>(path: string, signal: AbortSignal) {
  const stream = createWriteStream(path, { signal });
  return {
    write: (chunk: T) =>
      new Promise<void>((resolve, reject) =>
        stream.write(JSON.stringify(chunk) + '\n', (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }),
      ),
    end: (chunk: T) => {
      return new Promise<void>((resolve, reject) => {
        stream.end(JSON.stringify(chunk) + '\n');
        stream.close();
        stream.on('close', resolve);
      });
    },
  };
}

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

export async function observeFile(
  filePath: string,
  outputStream: Writable,
  signal: AbortSignal,
) {
  const stream = readJsonl(filePath, {
    signal,
  });
  // const watcher = chokidar.watch(filePath, {
  //   persistent: false,
  //   alwaysStat: false,
  //   disableGlobbing: true,
  //   depth: 0,
  //   atomic: true,
  // });
  // Handle termination of file observation
  const cleanup = () => {
    if (outputStream.writable) {
      outputStream.end();
    }
    console.log('Cleaning up');
    // watcher.close();
  };

  signal.addEventListener('abort', cleanup);
  outputStream.on('close', cleanup);
  outputStream.on('error', (error) => {
    console.error(error);
    cleanup();
  });

  // keep it blocking because we don't want to start the watch until the current content is sent
  for await (const line of stream) {
    if (!write(line)) {
      console.log('Could not write to stream');
      return; // Stop observing if the stream ends due to a complete/error entry
    }
  }

  // Get the current size of the file
  let lastSize = await stat(filePath).then((it) => it.size);

  for await (const _ of watch(filePath, {
    persistent: false,
    recursive: false,
  })) {
    await read();
  }

  async function read() {
    const currentSize = await stat(filePath).then((it) => it.size);
    if (currentSize > lastSize) {
      const start = lastSize;
      const end = currentSize - 1;
      const stream = readJsonl(filePath, {
        signal,
        start,
        end,
      });
      lastSize = currentSize; // Update lastSize for next change
      for await (const chunk of stream) {
        if (!write(chunk)) {
          cleanup();
          break;
        }
      }
    }
  }
  function write(chunk: string) {
    const entry = JSON.parse(chunk.trim());
    outputStream.write('\n');
    outputStream.write(chunk);
    if (entry.type === 'complete' || entry.type === 'error') {
      outputStream.end();
      return false;
    }
    return true;
  }
}

function readFileFromPositionSync(
  filePath: string,
  startPosition: number,
): string {
  // Open the file in read-only mode
  const fd = openSync(filePath, 'r');
  try {
    // Get the file size
    const { size } = statSync(filePath);

    // Calculate the remaining length to read
    const length = size - startPosition;

    // Allocate a buffer to hold the remaining content
    const buffer = Buffer.alloc(length);

    // Read the content from the specified position till the end
    const bytesRead = readSync(fd, buffer as any, 0, length, startPosition);

    // Convert the buffer to a string and return the content
    return buffer.toString('utf-8', 0, bytesRead);
  } finally {
    // Close the file descriptor
    closeSync(fd);
  }
}
