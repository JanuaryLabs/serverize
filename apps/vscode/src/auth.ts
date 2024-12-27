import { GithubAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from 'serverize';

export async function signInWithGithub(accessToken: string) {
  const credential = GithubAuthProvider.credential(accessToken);
  const result = await signInWithCredential(auth, credential);
  const user = result.user;
  const token = await user.getIdToken(true);
  return { user, token, accessToken: credential?.accessToken };
}
