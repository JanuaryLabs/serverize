import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
import dockerRouter from './docker/docker.router.ts';
import managementRouter from './management/management.router.ts';
import operationsRouter from './operations/operations.router.ts';
import projectsRouter from './projects/projects.router.ts';
import rootRouter from './root/root.router.ts';
export default [
  dockerRouter,
  managementRouter,
  operationsRouter,
  projectsRouter,
  rootRouter,
] as [string, Hono<HonoEnv>][];
