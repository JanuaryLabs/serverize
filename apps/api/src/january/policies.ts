import { verifyToken } from '#core/identity/subject.ts';

import { ProblemDetailsException } from 'rfc-7807-problem-details';

import { policy } from '@january/declarative';
import type { HonoEnv } from '#core/utils.ts';

export default {
  authenticated: policy.http<HonoEnv>(async (context) => {
    await verifyToken(context.req.header('Authorization'));
    return true;
  }),
  adminOnly: policy.http<HonoEnv>(async (context) => {
    if (!context.var.subject) {
      return false;
    }
    return context.var.subject.claims.admin;
  }),
  notImplemented: policy.http<HonoEnv>(() => {
    throw new ProblemDetailsException({
      title: 'Not implemented',
      detail: 'This feature is not implemented yet',
      status: 501,
    });
  }),
};
