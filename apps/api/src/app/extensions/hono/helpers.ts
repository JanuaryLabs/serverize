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

export function createOutput(
  context: Context,
): trigger.http.outputWithFinalizer {
  let result: Response;
  return {
    raw: (value: any) => {
      result = value;
    },
    nocontent() {
      result = context.body(null, 204);
    },
    ok(value?: unknown) {
      if (value === undefined || value === null) {
        result = context.body(null, 204);
      } else {
        result = context.json(value, 200);
      }
    },
    created(valueOrUri: unknown, value?: unknown) {
      if (typeof valueOrUri === 'string') {
        if (value) {
          result = context.json(value, 201, {
            Location: valueOrUri,
          });
        } else {
          result = context.body(null, 201, {
            Location: valueOrUri,
          });
        }
      } else {
        result = context.json(valueOrUri!, 201);
      }
    },
    redirect(uri: string | URL, statusCode?: unknown) {
      result = context.redirect(
        uri.toString(),
        (statusCode as RedirectStatusCode) ?? undefined,
      );
    },
    finalize() {
      return result;
    },
  };
}
