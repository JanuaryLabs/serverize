import { onIdTokenChanged } from 'firebase/auth';

import { Serverize } from '@serverize/client';

import type { Healthcheck } from '../program';
import { auth } from './firebase';

const serverizeApiUrl =
  process.env.API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://serverize/client.january.sh');

export const serverizeManagementUrl =
  process.env.MANAGEMENT_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3100'
    : 'https://serverize-manager.january.sh');
export const serverizeManagementWs =
  process.env.MANAGEMENT_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'ws://localhost:3100'
    : 'wss://serverize-manager.january.sh');

export const client = new Serverize({
  token: 'token',
  baseUrl: serverizeApiUrl,
});

onIdTokenChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken();
    client.setOptions({ token });
  } else {
    client.setOptions({ token: '' });
  }
});

export interface ReleaseInfo {
  channel: 'dev' | 'preview';
  releaseName: string;
  projectId: string;
  projectName: string;
  serviceName?: string;
  image: string;
  volumes?: string[];
  environment?: Record<string, string>;
}

export function makeImageName(
  projectName: string,
  channel: string,
  release: string,
) {
  return `serverize-${projectName}-${channel}:${release}`;
}

export interface RuntimeConfig {
  port?: number;
  image?: string | null;
  Healthcheck?: Healthcheck;
}
