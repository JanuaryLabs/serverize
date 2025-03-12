import './features/crons.ts';
import './features/listeners.ts';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import type { StatusCode } from 'hono/utils/http-status';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import type { HonoEnv } from '#core/utils.ts';
import routes from './features/routes.ts';

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
    return context.json(
      {
        title: error.message,
        status: error.status,
        code: cause?.code,
        errors: cause?.errors,
        detail: cause?.detail,
      },
      error.status,
    );
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
