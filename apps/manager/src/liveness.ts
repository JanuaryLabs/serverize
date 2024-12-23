import { createRecorder, retryPromise } from 'serverize/utils';

export async function liveness(projectUrl: string) {
  const recorder = createRecorder({
    label: 'isContainerAlive',
    verbose: true,
  });
  recorder.record('healthCheck');
  await retryPromise(async () => {
    const res = await fetch(projectUrl);
    if (!res.ok) {
      throw new Error('Failed to fetch');
    }
  });
  recorder.recordEnd('healthCheck');

  recorder.end();
  // return port;
}
