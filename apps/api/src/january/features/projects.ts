import { tables } from '@workspace/entities';
import { policies } from '@workspace/extensions/identity';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
  patchEntity,
  removeEntity,
  saveEntity,
  upsertEntity,
  useTransaction,
} from '@workspace/extensions/postgresql';
import {
  encrypt,
  getChannelEnv,
  getProjectKey,
} from '@workspace/extensions/user';
import { channelSchema, orgNameValidator } from '@workspace/extensions/zod';
import z from 'zod';

import { ProblemDetailsException } from 'rfc-7807-problem-details';

import { feature, trigger, workflow } from '@january/declarative';
import { firebaseApp } from '@workspace/extensions/firebase-auth';
import { getAuth } from 'firebase-admin/auth';

export default feature({
  workflows: [
    workflow('CreateToken', {
      tag: 'tokens',
      trigger: trigger.http({
        method: 'post',
        path: '/',
        policies: [policies.authenticated],
        input: (trigger) => ({
          projectName: {
            select: trigger.body.projectName,
            against: orgNameValidator,
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.projects, 'projects')
          .where('projects.name = :name', { name: input.projectName })
          .select(['projects.id']);
        const [project] = await execute(qb);
        if (!project) {
          throw new ProblemDetailsException({
            status: 404,
            title: 'Project not found',
            detail: `Project with name '${input.projectName}' not found`,
          });
        }
        const token = crypto.randomUUID().replaceAll('-', '');
        await saveEntity(tables.apiKeys, {
          key: token,
          projectId: project.id,
        });
        return token;
      },
    }),
    workflow('RevokeToken', {
      tag: 'tokens',
      trigger: trigger.http({
        method: 'delete',
        path: '/',
        policies: [policies.authenticated],
        input: (trigger) => ({
          projectName: {
            select: trigger.body.projectName,
            against: z.string(),
          },
          token: {
            select: trigger.body.token,
            against: z.string(),
          },
        }),
      }),
      execute: async ({ input }) => {
        const projectQb = createQueryBuilder(tables.projects, 'projects')
          .where('projects.name = :name', { name: input.projectName })
          .select(['projects.id']);
        const [project] = await execute(projectQb);
        if (!project) {
          throw new ProblemDetailsException({
            status: 404,
            title: 'Project not found',
            detail: `Project with name '${input.projectName}' not found`,
          });
        }
        const qb = createQueryBuilder(tables.apiKeys, 'apiKeys')
          .where('apiKeys.projectId = :projectId', {
            projectId: project.id,
          })
          .andWhere('apiKeys.key = :key', { key: input.token });
        await removeEntity(tables.apiKeys, qb);
      },
    }),
    workflow('ListTokens', {
      tag: 'tokens',
      trigger: trigger.http({
        policies: [policies.authenticated],
        method: 'get',
        path: '/',
        input: (trigger) => ({
          projectName: {
            select: trigger.query.projectName,
            against: z.string(),
          },
        }),
      }),
      execute: async ({ input }) => {
        const projectQb = createQueryBuilder(tables.projects, 'projects')
          .where('projects.name = :name', { name: input.projectName })
          .select(['projects.id']);
        const [project] = await execute(projectQb);
        if (!project) {
          throw new ProblemDetailsException({
            status: 404,
            title: 'Project not found',
            detail: `Project with name '${input.projectName}' not found`,
          });
        }
        const qb = createQueryBuilder(tables.apiKeys, 'apiKeys')
          .where('apiKeys.projectId = :projectId', {
            projectId: project.id,
          })
          .innerJoinAndSelect('apiKeys.project', 'projects');

        const records = await execute(qb);
        return records;
      },
    }),
    workflow('GetToken', {
      tag: 'tokens',
      trigger: trigger.http({
        method: 'get',
        path: '/:token',
        input: (trigger) => ({
          token: {
            select: trigger.path.token,
            against: z.string(),
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.apiKeys, 'apiKeys')
          .andWhere('apiKeys.key = :key', { key: input.token })
          .innerJoinAndSelect('apiKeys.project', 'projects');

        const [token] = await execute(qb);
        if (!token) {
          throw new ProblemDetailsException({
            status: 404,
          });
        }
        return token;
      },
    }),

    // #region Releases
    workflow('CreateRelease', {
      tag: 'releases',
      trigger: trigger.http({
        path: '/',
        method: 'post',
        input: (trigger) => ({
          releaseName: {
            select: trigger.body.releaseName,
            against: orgNameValidator,
          },
          projectId: {
            select: trigger.body.projectId,
            against: z.string().uuid(),
          },
          channel: {
            select: trigger.body.channel,
            against: channelSchema,
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.releases, 'releases')
          .where('releases.name = :name', { name: input.releaseName })
          .andWhere('releases.projectId = :projectId', {
            projectId: input.projectId,
          })
          .andWhere('releases.channel = :channel', { channel: input.channel })
          .limit(1);

        const [release] = await execute(qb);
        if (release) {
          //
        }

        let { id } = await saveEntity(tables.releases, {
          projectId: input.projectId,
          status: 'in_progress',
          channel: input.channel,
          name: input.releaseName,
        });
        return { id };
      },
    }),
    workflow('CompleteRelease', {
      tag: 'releases',
      trigger: trigger.http({
        method: 'patch',
        path: '/complete/:releaseId',
        input: (trigger) => ({
          releaseId: {
            select: trigger.path.releaseId,
            against: z.string().uuid(),
          },
          conclusion: {
            select: trigger.body.conclusion,
            against: z.enum(['success', 'failure']),
          },
          containerName: {
            select: trigger.body.containerName,
            against: z.string().optional(),
          },
          tarLocation: {
            select: trigger.body.tarLocation,
            against: z.string().optional(),
          },
        }),
      }),
      execute: async ({ input, output }) => {
        await useTransaction(async () => {
          const patchObject: Record<string, any> = {};
          (['conclusion', 'containerName', 'tarLocation'] as const).forEach(
            (prop) => {
              if (input[prop]) {
                patchObject[prop] = input[prop];
              }
            },
          );
          const releaseQb = createQueryBuilder(
            tables.releases,
            'releases',
          ).where('releases.id = :releaseId', { releaseId: input.releaseId });
          const [release] = await execute(releaseQb);
          if (!release) {
            throw new ProblemDetailsException({
              status: 400,
              title: 'Release not found',
              detail: `Release with id ${input.releaseId} not found`,
            });
          }
          await patchEntity(releaseQb, { ...patchObject, status: 'completed' });

          if (input.conclusion !== 'success') {
            return;
          }
          const qb = createQueryBuilder(tables.releases, 'releases')
            .where('"releases"."projectId" = :projectId', {
              projectId: release.projectId,
            })
            .andWhere('releases.channel = :channel', {
              channel: release.channel,
            })
            .andWhere('releases.id != :releaseId', {
              releaseId: input.releaseId,
            })
            .andWhere('releases.name = :name', { name: release.name });
          if (release.serviceName) {
            qb.andWhere('releases.serviceName = :serviceName', {
              serviceName: release.serviceName,
            });
          }

          await qb.softDelete().execute();
        });
        return output.ok({});
      },
    }),
    workflow('PatchRelease', {
      tag: 'releases',
      trigger: trigger.http({
        method: 'patch',
        path: '/:releaseId',
        input: (trigger) => ({
          releaseId: {
            select: trigger.path.releaseId,
            against: z.string().uuid(),
          },
          status: {
            select: trigger.body.status,
            against: z.enum(['requested', 'waiting', 'completed']).optional(),
          },
          conclusion: {
            select: trigger.body.conclusion,
            against: z.enum(['success', 'failure']).optional(),
          },
          containerName: {
            select: trigger.body.containerName,
            against: z.string().optional(),
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.releases, 'releases').where(
          'releases.id = :releaseId',
          { releaseId: input.releaseId },
        );
        const patchObject: Record<string, any> = {};
        (['status', 'conclusion', 'containerName'] as const).forEach((prop) => {
          if (input[prop]) {
            patchObject[prop] = input[prop];
          }
        });
        await patchEntity(qb, patchObject);
        return {};
      },
    }),
    workflow('CreateReleaseSnapshot', {
      tag: 'releases',
      trigger: trigger.http({
        path: '/:releaseId/snapshots',
        method: 'post',
        input: (trigger) => ({
          releaseId: {
            select: trigger.path.releaseId,
            against: z.string().uuid(),
          },
          name: {
            select: trigger.body.name,
            against: z.string().trim().min(1),
          },
        }),
      }),
      execute: async ({ input }) => {
        const { id } = await saveEntity(tables.snapshots, {
          releaseId: input.releaseId,
          name: input.name,
        });
        return { id };
      },
    }),
    workflow('ListReleases', {
      tag: 'releases',
      trigger: trigger.http({
        path: '/',
        method: 'get',
        input: (trigger) => ({
          projectId: {
            select: trigger.query.projectId,
            against: z.string().uuid().optional(),
          },
          channel: {
            select: trigger.query.channel,
            against: channelSchema.optional(),
          },
          status: {
            select: trigger.query.status,
            against: z.string().optional(),
          },
          conclusion: {
            select: trigger.query.conclusion,
            against: z.string().optional(),
          },
          pageSize: {
            select: trigger.query.pageSize,
            against: z.coerce
              .number()
              .int()
              .min(1)
              .max(50)
              .default(50)
              .optional(),
          },
          pageNo: {
            select: trigger.query.pageNo,
            against: z.coerce.number().int().min(1).optional(),
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.releases, 'releases');
        for (const prop of [
          'projectId',
          'channel',
          'status',
          'conclusion',
        ] as const) {
          if (input[prop]) {
            qb.andWhere(`releases.${prop} = :${prop}`, {
              [prop]: input[prop],
            });
          }
        }
        qb.innerJoinAndSelect('releases.project', 'projects');

        const paginationMetadata = deferredJoinPagination(qb, {
          pageSize: input.pageSize,
          pageNo: input.pageNo,
          count: await qb.getCount(),
        });

        const records = await execute(qb);
        return {
          records,
          meta: paginationMetadata(records),
        };
      },
    }),
    // #endregion
    // #region Secrets
    workflow('CreateSecret', {
      tag: 'secrets',
      trigger: trigger.http({
        method: 'post',
        path: '/',
        input: (trigger) => ({
          projectId: {
            select: trigger.body.projectId,
            against: z.string().uuid(),
          },
          channel: {
            select: trigger.body.channel,
            against: channelSchema,
          },
          secretLabel: {
            select: trigger.body.secretLabel,
            against: z.string().trim().min(1),
          },
          secretValue: {
            select: trigger.body.secretValue,
            against: z.string().min(1),
          },
        }),
      }),
      execute: async ({ input }) => {
        const key = await getProjectKey(input.projectId);
        const { nonce, secret } = await encrypt(key, input.secretValue);
        await upsertEntity(
          tables.secrets,
          {
            projectId: input.projectId,
            label: input.secretLabel,
            channel: input.channel,
            nonce,
            secret,
          },
          {
            conflictColumns: ['projectId', 'label'],
            upsertColumns: ['nonce', 'secret'],
          },
        );
        return {};
      },
    }),
    workflow('GetSecrets', {
      tag: 'secrets',
      trigger: trigger.http({
        method: 'get',
        path: '/',
        input: (trigger) => ({
          projectId: {
            select: trigger.query.projectId,
            against: z.string().uuid(),
          },
          channel: {
            select: trigger.query.channel,
            against: channelSchema,
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.secrets, 'secrets')
          .where('secrets.projectId = :projectId', {
            projectId: input.projectId,
          })
          .andWhere('secrets.channel = :channel', {
            channel: input.channel,
          })
          .select(['secrets.id', 'secrets.label']);
        const secrets = await execute(qb);
        return secrets;
      },
    }),
    workflow('DeleteSecret', {
      tag: 'secrets',
      trigger: trigger.http({
        method: 'delete',
        path: '/:id',
        input: (trigger) => ({
          id: {
            select: trigger.path.id,
            against: z.string().uuid(),
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.secrets, 'secrets').where(
          'secrets.id = :id',
          { id: input.id },
        );
        await removeEntity(tables.secrets, qb);
      },
    }),
    workflow('GetSecretsValues', {
      tag: 'secrets',
      trigger: trigger.http({
        method: 'get',
        path: '/values',
        policies: [policies.authenticated],
        input: (trigger) => ({
          projectId: {
            select: trigger.query.projectId,
            against: z.string().uuid(),
          },
          channel: {
            select: trigger.query.channel,
            against: channelSchema,
          },
        }),
      }),
      execute: async ({ input }) => {
        const env = await getChannelEnv({
          projectId: input.projectId,
          channel: input.channel,
        });
        return env;
      },
    }),
    workflow('ExchangeToken', {
      tag: 'tokens',
      trigger: trigger.http({
        method: 'post',
        path: '/exchange',
        input: (trigger) => ({
          token: {
            select: trigger.body.token,
            against: z.string(),
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.apiKeys, 'apiKeys')
          .where('apiKeys.key = :key', { key: input.token })
          .innerJoinAndSelect('apiKeys.project', 'projects')
          .innerJoinAndSelect('projects.workspace', 'workspace');

        const [apiKey] = await execute(qb);
        if (!apiKey) {
          throw new ProblemDetailsException({
            status: 401,
            title: 'Invalid API token',
            detail: 'The provided API token is invalid or has been revoked',
          });
        }

        const auth = getAuth(firebaseApp);
        const customToken = await auth.createCustomToken(crypto.randomUUID(), {
          source: 'api',
          organizationId: apiKey.project.workspace.organizationId,
          workspaceId: apiKey.project.workspaceId,
          projectId: apiKey.projectId,
          aknowledged: true,
        });
        return { accessToken: customToken };
      },
    }),
    workflow('InvalidateOrganizationTokens', {
      tag: 'tokens',
      trigger: trigger.http({
        method: 'delete',
        path: '/organization/:organizationId',
        policies: [policies.authenticated],
        input: (trigger) => ({
          organizationId: {
            select: trigger.path.organizationId,
            against: z.string().uuid(),
          },
        }),
      }),
      execute: async ({ input }) => {
        const qb = createQueryBuilder(tables.apiKeys, 'apiKeys')
          .innerJoin('apiKeys.project', 'projects')
          .innerJoin('projects.workspace', 'workspace')
          .where('workspace.organizationId = :organizationId', {
            organizationId: input.organizationId,
          });

        await removeEntity(tables.apiKeys, qb);
        return {};
      },
    }),
  ],
});
