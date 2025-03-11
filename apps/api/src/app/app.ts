import './features/crons';
import './features/listeners';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import type { StatusCode } from 'hono/utils/http-status';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import type { HonoEnv } from '#core/utils.ts';
import routes from './features/routes';

const application = new Hono<HonoEnv>();
application.use(timing(), cors(), logger(), contextStorage());
routes.forEach(([path, route]) => {
  application.route(path, route);
});

application.notFound(() => {
  throw new ProblemDetailsException({
    title: 'Not Found',
    status: 404,
    detail: 'The requested resource could not be found',
  });
});

application.onError((error, context) => {
  if (error instanceof ProblemDetailsException) {
    context.status((error.Details.status as StatusCode) ?? 500);
    return context.json(error.Details);
  }
  if (error instanceof HTTPException) {
    const cause = error.cause as Record<string, unknown>;
    if (cause.code === 'api/validation-failed') {
      return context.json(
        {
          title: error.message,
          status: error.status,
          code: cause?.code,
          errors: cause?.details,
        },
        error.status,
      );
    } else {
      return context.json(
        {
          title: error.message,
          status: error.status,
          code: cause?.code,
          detail: cause?.details,
        },
        error.status,
      );
    }
  }
  console.error(error);

  context.status(500);
  return context.json({
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
  });
});

export default application;
