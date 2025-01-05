import { trigger } from '@january/declarative';

export async function sayHi(output: trigger.http.output, signal: AbortSignal) {
  return output.ok({
    status: 'UP',
  });
}