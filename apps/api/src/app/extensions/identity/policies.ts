import { authenticated } from './authenticated.policy.ts';
import { adminOnly } from './admin-only.policy.ts';
import { notImplemented } from './not-implemented.policy.ts';

export const policies = {
  authenticated: authenticated,
  adminOnly: adminOnly,
  notImplemented: notImplemented,
};