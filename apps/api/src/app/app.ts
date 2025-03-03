import './features/crons';
import './features/listeners';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import type { StatusCode } from 'hono/utils/http-status';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import type { HonoEnv } from '#core/utils.ts';
import routes from './features/routes';

const application = new Hono<HonoEnv>();
application.use(timing(), cors(), logger(), contextStorage());

application.notFound(() => {
  throw new ProblemDetailsException({
    title: 'Not Found',
    status: 404,
    detail: 'The requested resource could not be found',
  });
});

application.onError((err, context) => {
  if (err instanceof ProblemDetailsException) {
    context.status((err.Details.status as StatusCode) ?? 500);
    return context.json(err.Details);
  }

  console.error(err);

  context.status(500);
  return context.json({
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
  });
});

routes.forEach(([path, route]) => {
  application.route(path, route);
});

export default application;
