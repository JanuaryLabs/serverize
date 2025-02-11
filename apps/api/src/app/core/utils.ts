import { type IdentitySubject } from '#core/identity/subject.ts';
export interface HonoEnv {
  Variables: { subject: IdentitySubject | null };
}
