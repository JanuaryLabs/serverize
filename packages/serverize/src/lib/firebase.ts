import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { mkdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';


import { getFile, safeFail } from 'serverize/utils';

class FilePersistence {
  public static type = 'NONE' as const;
  public type = 'NONE' as const;
  async _isAvailable() {
    return true;
  }

  decode(key: string) {
    return key;
    // return Buffer.from(key, 'base64').toString('base64') === key
    //   ? key
    //   : Buffer.from(key, 'base64').toString('utf-8').toString()
  }

  async _set(key: string, value: unknown) {
    const fullPath = join(tmpdir(), this.decode(key));
    await mkdir(dirname(fullPath), { recursive: true });
    return writeFile(fullPath, JSON.stringify(value));
  }

  async _get(base64: string) {
    return await getFile(join(tmpdir(), this.decode(base64)))
      .then((data) => {
        if (!data) {
          return null;
        }
        return safeFail(() => JSON.parse(data), null);
      })
      .catch((error) => {
        return null;
      });
  }

  async _remove(base64: string) {
    await rm(join(tmpdir(), this.decode(base64)), { force: true });
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
