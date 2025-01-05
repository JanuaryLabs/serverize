import { type IdentitySubject } from '@workspace/identity';
export interface HonoEnv {
  Variables: { subject: IdentitySubject | null };
}
