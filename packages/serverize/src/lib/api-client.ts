import { Serverize, type Servers } from '@serverize/client';
import { onIdTokenChanged } from 'firebase/auth';

import type { Healthcheck } from '../program';
import { auth } from './firebase';

export const serverizeApiUrl =
  (process.env.API_URL as Servers | undefined) ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://serverize-api.january.sh');

export const serverizeManagementUrl =
  process.env.MANAGEMENT_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3100'
    : 'https://serverize-manager.january.sh');

export const client = new Serverize({
  token: '',
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

export function makeImageName(
  projectName: string,
  channel: string,
  release: string,
) {
  return `serverize-${projectName}-${channel}:${release}`.toLowerCase();
}

export interface RuntimeConfig {
  port?: number;
  image?: string | null;
  Healthcheck?: Healthcheck;
}
