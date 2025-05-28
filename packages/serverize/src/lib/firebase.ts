import { tmpdir } from 'os';
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { mkdir, rm, writeFile } from 'fs/promises';

import { dirname, join } from 'path';
import { getFile } from '@serverize/utils';

const file =
  process.env.NODE_ENV === 'development'
    ? 'serverize.dev.txt'
    : 'serverize.txt';

class FilePersistence {
  public static type = 'LOCAL' as const;
  public type = 'LOCAL' as const;
  async _isAvailable() {
    return true;
  }

  async _set(key: string, value: unknown) {
    const fullPath = join(tmpdir(), file);
    await mkdir(dirname(fullPath), { recursive: true });
    return writeFile(fullPath, JSON.stringify(value)).catch((error) => {
      console.error('Error writing file', error);
      return null;
    });
  }

  async _get(key: string) {
    const fullPath = join(tmpdir(), file);
    return getFile(fullPath)
      .then((data) => (data ? JSON.parse(data) : null))
      .catch((error) => {
        console.error('Error reading file', error);
        return null;
      });
  }

  async _remove(key: string) {
    await rm(join(tmpdir(), file), { force: true });
  }

  _addListener(_key: string, _listener: unknown) {
    // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
    return;
  }
  _removeListener(_key: string, _listener: unknown) {
    // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
    return;
  }
}

const app = initializeApp({
  apiKey: 'AIzaSyA6OFi52evEph_dFBFxHd-71BIGpJiCTOA',
  authDomain: 'january-9f554.firebaseapp.com',
  projectId: 'january-9f554',
  storageBucket: 'january-9f554.appspot.com',
  messagingSenderId: '299506012875',
  appId: '1:299506012875:web:ac6e9ff54cd104fdfcc14e',
});

export const auth = initializeAuth(app, {
  persistence: [FilePersistence],
});
