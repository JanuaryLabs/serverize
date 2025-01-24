import { observeFile } from '@workspace/extensions/user';
import * as why from './why';

export default function (gracefulController: AbortController) {
  {
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      gracefulController.signal,
    ]);
    const stream = observeFile({
      filePath: '/var/log/nginx/access.jsonl',
      autoRestart: false,
      signal: signal,
    });
    why.watchAccessLog(stream, {
      signal,
      abort: () => controller.abort(),
    });
  }
}
