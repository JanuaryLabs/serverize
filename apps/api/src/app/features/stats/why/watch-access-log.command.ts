import { Readable } from 'node:stream';
import { safeFail } from '@workspace/extensions/user';

export async function watchAccessLog(
  stream: Readable,
  controller: AbortController,
) {
  for await (const line of stream) {
    console.log(safeFail(() => JSON.parse(line), null));
  }
}
