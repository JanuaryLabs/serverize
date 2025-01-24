import { Readable } from 'node:stream';

export async function watchAccessLog(
  stream: Readable,
  controller: AbortController,
) {
  for await (const line of stream) {
    console.log(line);
  }
}
