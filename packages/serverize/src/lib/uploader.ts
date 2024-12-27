import { rm } from 'fs/promises';
import { Upload } from 'tus-js-client';

import { logger } from '../program';
import { type ImageDetails } from './image';

export async function pushImage(
  details: ImageDetails,
  onProgress: (current: string) => void,
) {
  const chunkSize = mbToBytes(6);
  const parallelChunks = Math.floor(details.fileSize / chunkSize);
  const endpoint =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8085/files'
      : 'https://tusd.january.sh/files';

  logger(`Using endpoint: ${endpoint}`);
  logger(`File size: ${bytesToMb(details.fileSize)} MB`);
  return new Promise<string>((resolve, reject) => {
    const upload = new Upload(details.fileStream, {
      endpoint: endpoint,
      chunkSize: chunkSize,
      parallelUploads: parallelChunks,
      uploadDataDuringCreation: true,
      metadata: {
        filetype: 'application/x-tar',
      },
      onBeforeRequest(req) {
        if (process.env.NODE_ENV !== 'development') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore workaround to fix the redirect because tusd doesn't follow redirect
          req._url = req._url.replace('http://', 'https://');
        }
      },
      onError: reject,
      onChunkComplete(chunkSize, bytesAccepted, bytesTotal = details.fileSize) {
        const progress = Math.floor((bytesAccepted / bytesTotal) * 100);
        onProgress(String(progress));
      },
      async onSuccess() {
        resolve(upload.url!.split('/').pop()!);
        logger('Upload completed');
        await rm(details.filePath, { force: true });
      },
    });
    upload.start();
  });
}

const bytesToMb = (bytes: number) => bytes / 1024 / 1024;
const mbToBytes = (mb: number) => mb * 1024 * 1024;
