import { trigger } from '@january/declarative';

export async function emptyFavicon(
  output: trigger.http.output,
  signal: AbortSignal,
) {
  return output.ok();
}
