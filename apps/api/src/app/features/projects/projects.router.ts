import { Hono } from 'hono';
import { createOutput, consume } from '@workspace/extensions/hono';
import { apiReference } from '@scalar/hono-api-reference';
import { policies } from '@workspace/extensions/identity';
import z from 'zod';
import swagger from './projects.swagger.json';
import { authorize } from '@workspace/identity';
import * as tokens from './tokens';
import { parseOrThrow } from '@workspace/validation';
import * as releases from './releases';
import * as secrets from './secrets';
import { type HonoEnv } from '@workspace/utils';
const router = new Hono<HonoEnv>();
router.get(
  '/projects/swagger',
  apiReference({
    spec: { url: swagger as any },
  }),
);
router.post(
  '/tokens',
  consume('application/json'),
  authorize(policies.authenticated),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(tokens.createTokenSchema, {
      projectId: body.projectId,
    });
    const output = createOutput(context);
    await tokens.createToken(
      input,
      output,
      context.var.subject!,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
router.delete(
  '/tokens',
  authorize(policies.authenticated),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(tokens.revokeTokenSchema, { token: body.token });
    const output = createOutput(context);
    await tokens.revokeToken(
      input,
      output,
      context.var.subject!,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
router.get('/tokens', authorize(), async (context, next) => {
  const output = createOutput(context);
  await tokens.listTokens(output, context.var.subject!, context.req.raw.signal);
  return output.finalize();
});
router.get('/tokens/:id', authorize(), async (context, next) => {
  const path = context.req.param();
  const input = parseOrThrow(tokens.getTokenSchema, { token: path.id });
  const output = createOutput(context);
  await tokens.getToken(input, output, context.req.raw.signal);
  return output.finalize();
});
router.post(
  '/releases',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(releases.createReleaseSchema, {
      releaseName: body.releaseName,
      projectId: body.projectId,
      channel: body.channel,
    });
    const output = createOutput(context);
    await releases.createRelease(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.patch(
  '/releases/complete/:releaseId',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const path = context.req.param();
    const body = await context.req.json();
    const input = parseOrThrow(releases.completeReleaseSchema, {
      releaseId: path.releaseId,
      conclusion: body.conclusion,
      containerName: body.containerName,
      tarLocation: body.tarLocation,
    });
    const output = createOutput(context);
    await releases.completeRelease(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.patch(
  '/releases/:releaseId',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const path = context.req.param();
    const body = await context.req.json();
    const input = parseOrThrow(releases.patchReleaseSchema, {
      releaseId: path.releaseId,
      status: body.status,
      conclusion: body.conclusion,
      containerName: body.containerName,
    });
    const output = createOutput(context);
    await releases.patchRelease(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.post(
  '/releases/:releaseId/snapshots',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const path = context.req.param();
    const body = await context.req.json();
    const input = parseOrThrow(releases.createReleaseSnapshotSchema, {
      releaseId: path.releaseId,
      name: body.name,
    });
    const output = createOutput(context);
    await releases.createReleaseSnapshot(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.get('/releases', authorize(), async (context, next) => {
  const query = context.req.query();
  const input = parseOrThrow(releases.listReleasesSchema, {
    projectId: query.projectId,
    channel: query.channel,
    status: query.status,
    conclusion: query.conclusion,
    pageSize: query.pageSize,
    pageNo: query.pageNo,
  });
  const output = createOutput(context);
  await releases.listReleases(input, output, context.req.raw.signal);
  return output.finalize();
});
router.delete(
  '/releases',
  authorize(policies.notImplemented, policies.authenticated),
  async (context, next) => {
    const query = context.req.query();
    const path = context.req.param();
    const input = parseOrThrow(releases.terminateReleaseSchema, {
      projectId: query.projectId,
      releaseName: path.releaseName,
      channelName: path.channelName,
    });
    const output = createOutput(context);
    await releases.terminateRelease(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.post(
  '/secrets',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(secrets.createSecretSchema, {
      projectId: body.projectId,
      channel: body.channel,
      secretLabel: body.secretLabel,
      secretValue: body.secretValue,
    });
    const output = createOutput(context);
    await secrets.createSecret(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.get('/secrets', authorize(), async (context, next) => {
  const query = context.req.query();
  const input = parseOrThrow(secrets.getSecretsSchema, {
    projectId: query.projectId,
    channel: query.channel,
  });
  const output = createOutput(context);
  await secrets.getSecrets(input, output, context.req.raw.signal);
  return output.finalize();
});
router.get(
  '/secrets/values',
  authorize(policies.authenticated),
  async (context, next) => {
    const query = context.req.query();
    const input = parseOrThrow(secrets.getSecretsValuesSchema, {
      projectId: query.projectId,
      channel: query.channel,
    });
    const output = createOutput(context);
    await secrets.getSecretsValues(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
export default ['/', router] as const;