import axios from 'axios';
import { Hono } from 'hono';
import z from 'zod';
import { authorize, policies } from '#core/identity';
import { type HonoEnv } from '#core/utils.ts';
import { parseOrThrow } from '#core/validation.ts';
import { consume, createOutput } from '#hono';
import * as operations from './operations';
const router = new Hono<HonoEnv>();
router.post(
  '/operations/releases/start',
  consume('application/json'),
  authorize(policies.authenticated),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(operations.startReleaseSchema, {
      releaseName: body.releaseName,
      projectId: body.projectId,
      projectName: body.projectName,
      channel: body.channel,
      tarLocation: body.tarLocation,
      runtimeConfig: body.runtimeConfig,
      port: body.port,
      protocol: body.protocol,
      image: body.image,
      volumes: context.req.queries('undefined'),
      serviceName: body.serviceName,
      environment: body.environment,
      jwt: context.req.header('Authorization'),
    });
    const output = createOutput(context);
    await operations.startRelease(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.post(
  '/operations/releases/:releaseName/restart',
  consume('application/json'),
  authorize(policies.authenticated),
  async (context, next) => {
    const path = context.req.param();
    const body = await context.req.json();
    const input = parseOrThrow(operations.restartReleaseSchema, {
      releaseName: path.releaseName,
      projectId: body.projectId,
      projectName: body.projectName,
      channel: body.channel,
      jwt: context.req.header('Authorization'),
    });
    const output = createOutput(context);
    await operations.restartRelease(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.post(
  '/operations/channels/:channelName/restart',
  consume('application/json'),
  authorize(policies.authenticated),
  async (context, next) => {
    const path = context.req.param();
    const body = await context.req.json();
    const input = parseOrThrow(operations.restartChannelSchema, {
      channel: path.channelName,
      projectId: body.projectId,
      projectName: body.projectName,
      jwt: context.req.header('Authorization'),
    });
    const output = createOutput(context);
    await operations.restartChannel(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.delete(
  '/operations/releases/:releaseName',
  authorize(),
  async (context, next) => {
    const path = context.req.param();
    const body = await context.req.json();
    const input = parseOrThrow(operations.deleteReleaseSchema, {
      releaseName: path.releaseName,
      projectId: body.projectId,
      channel: body.channel,
    });
    const output = createOutput(context);
    await operations.deleteRelease(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
export default ['/', router] as const;
