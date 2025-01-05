import { dataSource } from '@workspace/extensions/postgresql';
import { trigger } from '@january/declarative';

export async function healthCheck(
  output: trigger.http.output,
  signal: AbortSignal,
) {
  await dataSource.query('SELECT 1');
  return output.ok({
    status: 'UP',
  });
}