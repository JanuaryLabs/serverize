import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { exist } from 'serverize/utils';
import stats from './stats/stats.watchers';
const controller = new AbortController();

// Create access.jsonl if it doesn't exist
const LOGS_DIR = join('./', 'logs', 'access.jsonl');
if (!(await exist(LOGS_DIR))) {
  await fs.mkdir(dirname(LOGS_DIR), { recursive: true });
  await fs.writeFile(LOGS_DIR, '');
}

// Start the stats watcher
stats(controller);

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    controller.abort();
    process.exit();
  });
});
