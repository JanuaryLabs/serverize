import type { trigger } from '@january/declarative';
import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { type RedirectStatusCode } from 'hono/utils/http-status';
import { ProblemDetailsException } from 'rfc-7807-problem-details';

export const consume = (contentType: string) => {
  return createMiddleware(async (context, next) => {
    const clientContentType = context.req.header('Content-Type');
    if (clientContentType !== contentType) {
      throw new ProblemDetailsException({
        title: 'Unsupported Media Type',
        status: 415,
        detail: `Expected content type: ${contentType}, but got: ${clientContentType}`,
      });
    }
    await next();
  });
};
