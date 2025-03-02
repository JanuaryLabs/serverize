import {
  AuthClientErrorCode,
  type DecodedIdToken,
  FirebaseAuthError,
  getAuth,
} from 'firebase-admin/auth';
import { type IResult } from 'ua-parser-js';
import { UnauthorizedException } from '#core/exceptions.ts';
import { firebaseApp } from './firebase';

export interface ClientInfo {
  ip?: string | null;
  userAgent?: string | null;
  userAgentData: IResult;
}

export type IdentitySubject = {
  claims: DecodedIdToken;
};

export const auth = getAuth(firebaseApp);

function isBearerToken(
  token: string | null | undefined,
): token is `Bearer ${string}` {
  if (!token || typeof token !== 'string') {
    return false;
  }

  if (!token.startsWith('Bearer ')) {
    return false;
  }

  return true;
}

export async function verifyToken(token: string | null | undefined) {
  if (!isBearerToken(token)) {
    throw new UnauthorizedException();
  }

  try {
    return await auth.verifyIdToken(token.replace('Bearer ', ''));
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      if (error.hasCode(AuthClientErrorCode.ID_TOKEN_EXPIRED.code)) {
        const exception = new UnauthorizedException();
        exception.cause = error;
        throw exception;
      }
    }

    // TODO: log the error
    const exception = new UnauthorizedException();
    exception.cause = error;
    throw exception;
  }
}

export async function loadSubject(
  token: string | null | undefined,
): Promise<IdentitySubject | null> {
  if (!isBearerToken(token)) {
    return null;
  }

  try {
    const claims = await auth.verifyIdToken(token.replace('Bearer ', ''));
    return { claims };
  } catch (error) {
    return null;
  }
}
