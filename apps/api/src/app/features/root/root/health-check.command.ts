import { trigger } from '@january/declarative';
import { dataSource } from '@workspace/extensions/postgresql';

export async function healthCheck(
  output: trigger.http.output,
  signal: AbortSignal,
) {
  await dataSource.query('SELECT 1');
  return output.ok({
    status: 'UP',
  });
}
