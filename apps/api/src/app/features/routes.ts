import { type HonoEnv } from '@workspace/utils';
import { Hono } from 'hono';
import dockerRouter from './docker/docker.router';
import managementRouter from './management/management.router';
import operationsRouter from './operations/operations.router';
import projectsRouter from './projects/projects.router';
import rootRouter from './root/root.router';
import statsRouter from './stats/stats.router';
export default [
  dockerRouter,
  managementRouter,
  operationsRouter,
  projectsRouter,
  rootRouter,
  statsRouter,
] as [string, Hono<HonoEnv>][];
