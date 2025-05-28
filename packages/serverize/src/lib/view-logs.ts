import { safeFail } from '@serverize/utils';
import { showError, spinner, tell } from '../program';
import { client } from './api-client';

export function toBase64(data: any) {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export async function reportProgress(traceId: string) {
  const [readable, error] = await client.request('GET /operations/read', {
    traceId,
  });
  if (error) {
    showError(error);
    process.exit(1);
  }
  for await (const data of readable) {
    const payload = safeFail(() => JSON.parse(data), { message: '' });
    if (payload.type === 'error') {
      const error = payload.message;
      const message = safeFail(
        () => (typeof error === 'string' ? error : error.message).trim(),
        '',
      );
      if (message) {
        spinner.fail(`Failed to process image: ${message}`);
      } else {
        spinner.fail(`Failed to process image`);
        console.error(error);
      }
      process.exit(1);
    } else if (payload.type === 'complete') {
      tell(payload.message);
    } else if (payload.type === 'logs') {
      process.stdout.write(payload.message);
    } else {
      tell(payload.message);
    }
  }
}
