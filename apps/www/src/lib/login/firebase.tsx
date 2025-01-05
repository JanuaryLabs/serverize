'use client';

import { initializeApp } from 'firebase/app';
import {
  EmailAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  type User,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
} from 'firebase/auth';

import { useCallback, useEffect, useState } from 'react';

const app = initializeApp({
  apiKey: 'AIzaSyA6OFi52evEph_dFBFxHd-71BIGpJiCTOA',
  authDomain: 'january-9f554.firebaseapp.com',
  projectId: 'january-9f554',
  storageBucket: 'january-9f554.appspot.com',
  messagingSenderId: '299506012875',
  appId: '1:299506012875:web:ac6e9ff54cd104fdfcc14e',
});

export const auth = getAuth(app);

export function useUserProvider() {
  const [provider, setProvider] = useState<{
    isGithub: boolean;
    isGoogle: boolean;
    isAnonymous: boolean;
    isEmail: boolean;
  }>({
    isGithub: false,
    isGoogle: false,
    isAnonymous: false,
    isEmail: false,
  });

  const handle = useCallback((user: User | null) => {
    if (user) {
      setProvider({
        isGithub: user.providerData.some(
          (provider) => provider.providerId === GithubAuthProvider.PROVIDER_ID,
        ),
        isGoogle: user.providerData.some(
          (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID,
        ),
        isEmail: user.providerData.some(
          (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID,
        ),
        isAnonymous: user.isAnonymous,
      });
    } else {
      setProvider({
        isGithub: false,
        isGoogle: false,
        isAnonymous: false,
        isEmail: false,
      });
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, handle), [handle]);
  useEffect(() => onIdTokenChanged(auth, handle), [handle]);
  return provider;
}

export function useLogout() {
  const [loggedOut, setLoggedOut] = useState(false);
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoggedOut(true);
      }
    });
  }, []);

  return loggedOut;
}

// if (
//   process.env.__LOCAL__ &&
//   process.env.NODE_ENV === 'development' &&
//   process.env.FIREBASE_AUTH_EMULATOR_HOST
// ) {
//   console.log(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
//   connectAuthEmulator(
//     auth,
//     `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`,
//     {
//       disableWarnings: true,
//     },
//   );
// }
