import { watch } from 'chokidar';
import { readFile } from 'fs/promises';

import { join } from 'path';
import { Observable, debounceTime, from, switchMap, tap } from 'rxjs';
import { logger } from '../program';
import { getReleaseInfo } from './deploy-context';

export function watchFiles() {
  // const ast = getAst();
  const ast = null as any;
  return from(ast.getPaths()).pipe(
    tap((paths: any) => logger(`Watching files \n${paths.join(', ')}\n`)),
    switchMap((paths: any) => createWatcher(paths).pipe(debounceTime(1000))),
  );
  // filter((files) => files.some((it) => it.hasChanged)),
  // switchMap((filesToWatch) => readFiles(filesToWatch)),
}

export function createWatcher(files: string[]) {
  return new Observable((subscriber) => {
    const watcher = watch(files, {
      cwd: process.cwd(),
      persistent: true,
    });
    watcher.on('all', async (event, path) => {
      subscriber.next(path);
    });
    watcher.on('error', (error) => {
      subscriber.error(error);
    });
    return () => {
      watcher.close();
    };
  });
}

function readFiles(files: string[]) {
  return Promise.all(
    files.map(async (file) => ({
      path: file,
      content: await readFile(join(process.cwd(), file), 'utf-8'),
      // FIXME: we should use the file size to determine if the file has changed
      // or we should use the file hash to determine if the file has changed
      hasChanged: true,
    })),
  );
}

function watchMode(token: string) {
  logger('using watch mode');
  const releaseInfo = getReleaseInfo();
  // const ast = getAst();
  // followLogs(releaseInfo);
  // watchFiles()
  //   .pipe(
  //     switchMap(() => saveImage(releaseInfo.image)),
  //     exhaustMap((details) => pushImage(details, tell)),
  //     tap({
  //       next: tell,
  //       error: (error) => {
  //         spinner.fail('Failed to push the image');
  //         console.error(error);
  //       },
  //     }),
  //     switchMap((tarLocation) =>
  //       sse(ast, tarLocation, releaseInfo, token).pipe(
  //         finalize(() => {
  //           spinner.info('Deployed. Waiting for changes...');
  //           // spinner.info(
  //           //   `Accessible at https://${data.finalUrl}.january.sh`,
  //           // );
  //         }),
  //       ),
  //     ),
  //   )
  //   .subscribe({
  //     next: tell,
  //     error: (error) => {
  //       const message = safeFail(
  //         () => (typeof error === 'string' ? error : error.message).trim(),
  //         '',
  //       );
  //       if (message) {
  //         spinner.fail(`Failed to process image: ${message}`);
  //       } else {
  //         spinner.fail(`Failed to process image`);
  //         console.error(error);
  //       }
  //     },
  //   });
}
