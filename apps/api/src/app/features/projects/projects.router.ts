import { Hono } from 'hono';
import z from 'zod';
import { authorize } from '#core/authorize.ts';
import { policies } from '#core/identity';
import { type HonoEnv } from '#core/utils.ts';
import { parseOrThrow } from '#core/validation.ts';
import * as commonZod from '#extensions/zod/index.ts';
import { consume, createOutput } from '#hono';
import * as releases from './releases';
import * as secrets from './secrets';
import * as tokens from './tokens';
const router = new Hono<HonoEnv>();
router.post(
  '/tokens',
  consume('application/json'),
  authorize(policies.authenticated),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(tokens.createTokenSchema, {
      projectName: body.projectName,
    });
    const output = createOutput(context);
    await tokens.createToken(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.delete(
  '/tokens',
  authorize(policies.authenticated),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(tokens.revokeTokenSchema, {
      projectName: body.projectName,
      token: body.token,
    });
    const output = createOutput(context);
    await tokens.revokeToken(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.get(
  '/tokens',
  authorize(policies.authenticated),
  async (context, next) => {
    const query = context.req.query();
    const input = parseOrThrow(tokens.listTokensSchema, {
      projectName: query.projectName,
    });
    const output = createOutput(context);
    await tokens.listTokens(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.get('/tokens/:token', authorize(), async (context, next) => {
  const path = context.req.param();
  const input = parseOrThrow(tokens.getTokenSchema, { token: path.token });
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
router.delete('/secrets/:id', authorize(), async (context, next) => {
  const path = context.req.param();
  const input = parseOrThrow(secrets.deleteSecretSchema, { id: path.id });
  const output = createOutput(context);
  await secrets.deleteSecret(input, output, context.req.raw.signal);
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
router.post(
  '/tokens/exchange',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(tokens.exchangeTokenSchema, {
      token: body.token,
    });
    const output = createOutput(context);
    await tokens.exchangeToken(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.delete(
  '/tokens/organization/:organizationId',
  authorize(policies.authenticated),
  async (context, next) => {
    const path = context.req.param();
    const input = parseOrThrow(tokens.invalidateOrganizationTokensSchema, {
      organizationId: path.organizationId,
    });
    const output = createOutput(context);
    await tokens.invalidateOrganizationTokens(
      input,
      output,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
export default ['/', router] as const;
