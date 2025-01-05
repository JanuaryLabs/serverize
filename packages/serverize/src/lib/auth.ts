import { FirebaseError } from 'firebase/app';
import {
  AuthErrorCodes,
  EmailAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  getRedirectResult,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

import { auth } from './firebase';

import { box } from '@january/console';

export async function anonymouslySignIn() {
  if (auth.currentUser) {
    return {
      user: auth.currentUser,
      token: await auth.currentUser.getIdToken(true),
    };
  }
  const result = await signInAnonymously(auth);
  const user = result.user;
  const token = await user.getIdToken(true);
  return { user, token };
}

export async function signInWithGithub() {
  const isAlreadyLinkedToGithub = (auth.currentUser?.providerData ?? []).some(
    (provider) => provider.providerId === GithubAuthProvider.PROVIDER_ID,
  );
  // user is already linked to github
  if (auth.currentUser && isAlreadyLinkedToGithub) {
    return {
      user: auth.currentUser,
      token: await auth.currentUser.getIdToken(true),
    };
  }

  // user is already signed in with a different provider but anonymous
  // TODO: we should probably link the account here
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    return {
      user: auth.currentUser,
      token: await auth.currentUser.getIdToken(true),
    };
  }

  const provider = new GithubAuthProvider();
  provider.addScope('repo');
  provider.addScope('workflow');

  if (auth.currentUser?.isAnonymous) {
    const result = await linkWithPopup(auth.currentUser, provider);
    const user = result.user;
    const token = await user.getIdToken(true);
    return { user, token };
  }
  // try {
  //   const result = await signInWithPopup(auth, provider);
  //   const credential = GithubAuthProvider.credentialFromResult(result);
  //   const user = result.user;
  //   const token = await user.getIdToken(true);
  //   return { user, token, accessToken: credential?.accessToken };
  // } catch (error) {
  //   console.error(error);
  // }
  {
    try {
      await signInWithRedirect(auth, provider);
      const result = await getRedirectResult(auth);
      if (!result) {
        return { user: null };
      }
      const credential = GithubAuthProvider.credentialFromResult(result);
      const user = result.user;
      const token = await user.getIdToken(true);
      return { user, token, accessToken: credential?.accessToken };
    } catch (error) {
      console.error(error);
    }
  }
  return { user: null };
}

export async function linkAccountWithGithub() {
  if (!auth.currentUser) {
    return signInWithGithub();
  }

  const isAlreadyLinked = auth.currentUser.providerData.some(
    (provider) => provider.providerId === GithubAuthProvider.PROVIDER_ID,
  );
  if (isAlreadyLinked) {
    return;
  }

  const provider = new GithubAuthProvider();
  provider.addScope('repo');
  provider.addScope('workflow');

  try {
    const result = await linkWithPopup(auth.currentUser, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    const token = await user.getIdToken(true);
    return { user, token, accessToken: credential?.accessToken };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    if (error instanceof FirebaseError) {
      if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        const result = await signInWithPopup(auth, provider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        const user = result.user;
        const token = await user.getIdToken(true);
        return { user, token, accessToken: credential?.accessToken };
      }
    }
  }
  return { user: null };
}

export async function signInWithGoogle() {
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    return {
      user: auth.currentUser,
      token: await auth.currentUser.getIdToken(true),
    };
  }

  const provider = new GoogleAuthProvider();

  if (auth.currentUser?.isAnonymous) {
    const result = await linkWithPopup(auth.currentUser, provider);
    const user = result.user;
    const token = await user.getIdToken(true);
    return { user, token };
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    const token = await user.getIdToken(true);
    return { user, token, accessToken: credential?.accessToken };
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
        throw new Error(
          'Looks like you already have an account. Please sign in.',
        );
        // FIXME: Shouldn't we link the account here with google?
      }
    }
  }
  return { user: null };
}

export async function signUpWithEmail(email: string, password: string) {
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    return {
      user: auth.currentUser,
      token: await auth.currentUser.getIdToken(true),
    };
  }

  if (auth.currentUser?.isAnonymous) {
    const result = await linkWithCredential(
      auth.currentUser,
      EmailAuthProvider.credential(email, password),
    );
    const user = result.user;
    const token = await user.getIdToken(true);
    return { user, token };
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const token = await user.getIdToken(true);
    return { user, token };
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case AuthErrorCodes.INVALID_EMAIL:
          throw new Error('Invalid email address');
        case AuthErrorCodes.WEAK_PASSWORD:
          throw new Error('Password is too weak');
        case AuthErrorCodes.EMAIL_EXISTS:
          throw new Error(
            box(
              'User already exists',
              'Looks like you already have an account. Please sign in.',
              `$ npx serverize auth signin`,
            ),
          );
        case AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE:
          throw new Error(
            'Looks like you already have an account. Please sign in.',
          );
        default:
          throw error;
      }
    }
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    return {
      user: auth.currentUser,
      token: await auth.currentUser.getIdToken(true),
    };
  }

  if (auth.currentUser?.isAnonymous) {
    const result = await linkWithCredential(
      auth.currentUser,
      EmailAuthProvider.credential(email, password),
    );
    const user = result.user;
    const token = await user.getIdToken(true);
    return { user, token };
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const token = await user.getIdToken(true);
    return { user, token };
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case AuthErrorCodes.INVALID_IDP_RESPONSE:
        case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
        case AuthErrorCodes.INVALID_EMAIL:
          throw new Error('Wrong email or password, please try again.');
      }
    }
    throw error;
  }
}

export function initialise() {
  return new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        resolve(user);
        unsubscribe();
      },
      reject,
    );
  });
}
