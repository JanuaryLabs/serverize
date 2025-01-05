import { loadSubject } from '@workspace/extensions/identity';
import { type HonoEnv } from '@workspace/utils';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { type StatusCode } from 'hono/utils/http-status';

import './features/crons';
import './features/listeners';
import routes from './features/routes';
import { ProblemDetailsException } from 'rfc-7807-problem-details';

const application = new Hono<HonoEnv>();
application.use(cors(), logger());

application.use(async (context, next) => {
  const subject = await loadSubject(context.req.header('Authorization'));
  context.set('subject', subject);
  await next();
});

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
