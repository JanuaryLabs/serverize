import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import { rm } from 'fs/promises';
import fetch from 'node-fetch';
import { Upload } from 'tus-js-client';

import { logger } from '../program';
import { serverizeManagementUrl } from './api-client';
import { auth } from './firebase';
import { type ImageDetails } from './image';

const PROTOCOL = process.env.USE_PROTOCOL || 'tusv2';

export async function pushImage(
  details: ImageDetails,
  onProgress: (current: string) => void,
) {
  logger(`Using ${PROTOCOL} protocol`);
  switch (PROTOCOL) {
    case 'tusv2':
      return useTusV2(details, onProgress).finally(() =>
        logger('Upload completed'),
      );
    case 'tus':
      return useTus(details, onProgress).finally(() =>
        logger('Upload completed'),
      );
    case 'multipart':
      return useMultipart(details).finally(() => logger('Upload completed'));
    default:
      return useHttp(details).finally(() => logger('Upload completed'));
  }
}

async function useMultipart(details: ImageDetails) {
  const form = new FormData();
  form.append('file', await fileFromPath(details.filePath));

  const response = await fetch(`${serverizeManagementUrl}/upload-multipart`, {
    method: 'POST',
    body: form,
    headers: {
      Authorization: (process.env.SERVERIZE_API_TOKEN ||
        (await auth.currentUser?.getIdToken())) as any,
    },
  });

  await rm(details.filePath, { force: true });
  if (!response.ok) {
    const error = await response.text();
    throw {
      status: response.statusText,
      message: error,
    };
  }
  return response.text();
}
async function useHttp(details: ImageDetails) {
  const response = await fetch(`${serverizeManagementUrl}/upload`, {
    method: 'POST',
    duplex: 'half',
    body: details.fileStream,
    headers: {
      'Content-Type': 'application/x-tar',
      Authorization:
        process.env.SERVERIZE_API_TOKEN ||
        (await auth.currentUser?.getIdToken()),
    },
  } as any);
  await rm(details.filePath, { force: true });
  if (!response.ok) {
    const error = await response.text();
    throw {
      status: response.statusText,
      message: error,
    };
  }
  return response.text();
}
async function useTus(
  details: ImageDetails,
  onProgress: (current: string) => void,
) {
  const chunkSize = mbToBytes(20);
  return new Promise<string>((resolve, reject) => {
    const upload = new Upload(details.fileStream, {
      endpoint: `${serverizeManagementUrl}/files`,
      chunkSize: chunkSize,
      uploadSize: details.fileSize,
      metadata: {
        filetype: 'application/x-tar',
      },
      onError: reject,
      onChunkComplete(chunkSize, bytesAccepted, bytesTotal = details.fileSize) {
        const progress = Math.floor((bytesAccepted / bytesTotal) * 100);
        onProgress(String(progress));
      },
      async onSuccess() {
        resolve(upload.url!.replace(this.endpoint!, ''));
        await rm(details.filePath, { force: true });
      },
    });
    upload.start();
  });
}
async function useTusV2(
  details: ImageDetails,
  onProgress: (current: string) => void,
) {
  const chunkSize = mbToBytes(6);
  const parallelChunks = Math.floor(details.fileSize / chunkSize);

  return new Promise<string>((resolve, reject) => {
    const endpoint =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8085/files'
        : 'https://tusd.january.sh/files';

    logger(`Using endpoint: ${endpoint}`);
    const upload = new Upload(details.fileStream, {
      endpoint: endpoint,
      chunkSize: chunkSize,
      parallelUploads: parallelChunks,
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
        await rm(details.filePath, { force: true });
      },
    });
    upload.start();
  });
}
const bytesToMb = (bytes: number) => bytes / 1024 / 1024;
const mbToBytes = (mb: number) => mb * 1024 * 1024;
