import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
import dockerRouter from './docker/docker.router';
import managementRouter from './management/management.router';
import operationsRouter from './operations/operations.router';
import projectsRouter from './projects/projects.router';
import rootRouter from './root/root.router';
export default [
  dockerRouter,
  managementRouter,
  operationsRouter,
  projectsRouter,
  rootRouter,
] as [string, Hono<HonoEnv>][];
