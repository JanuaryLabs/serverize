import z from 'zod';

export * from './firebase';

export const env = {
  FIREBASE_AUTH_SERVICE_ACCOUNT_KEY: z.string(),
};
