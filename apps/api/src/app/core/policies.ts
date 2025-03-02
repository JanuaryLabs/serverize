import { type IdentitySubject, verifyToken } from '#core/identity/subject.ts';

import { createMiddleware } from 'hono/factory';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import { ForbiddenException } from '#core/exceptions.ts';
import type { HonoEnv } from '#core/utils.ts';

export default {
  authenticated: createMiddleware<{ Variables: { subject: IdentitySubject } }>(
    async (context, next) => {
      const subject = await verifyToken(context.req.header('Authorization'));
      context.set('subject', { claims: subject });
      await next();
    },
  ),
  adminOnly: createMiddleware<HonoEnv>(async (context) => {
    if (!context.var.subject) {
      throw new ForbiddenException();
    }
    return context.var.subject.claims.admin;
  }),
  notImplemented: createMiddleware<HonoEnv>(() => {
    throw new ProblemDetailsException({
      title: 'Not implemented',
      detail: 'This feature is not implemented yet',
      status: 501,
    });
  }),
};
