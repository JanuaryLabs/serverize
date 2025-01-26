import { verifyToken } from '@workspace/extensions/identity';

import { ProblemDetailsException } from 'rfc-7807-problem-details';

import { policy } from '@january/declarative';

export default {
  authenticated: policy.http(async (context) => {
    await verifyToken(context.req.header('Authorization'));
    return true;
  }),
  adminOnly: policy.http(async (context) => {
    if (!context.var.subject) {
      return false;
    }
    return context.var.subject.claims.admin;
  }),
  notImplemented: policy.http(() => {
    throw new ProblemDetailsException({
      title: 'Not implemented',
      detail: 'This feature is not implemented yet',
      status: 501,
    });
  }),
};
