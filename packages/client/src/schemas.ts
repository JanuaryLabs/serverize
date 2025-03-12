import z from 'zod';
import type { Endpoints } from './endpoints.ts';
import type { ParseError } from './http/parser.ts';
import {
  createUrl,
  formdata,
  json,
  nobody,
  toRequest,
  urlencoded,
} from './http/request.ts';
import * as container from './inputs/container.ts';
import * as operations from './inputs/operations.ts';
import * as organizations from './inputs/organizations.ts';
import * as projects from './inputs/projects.ts';
import * as releases from './inputs/releases.ts';
import * as secrets from './inputs/secrets.ts';
import * as tokens from './inputs/tokens.ts';
import * as users from './inputs/users.ts';
import * as workspaces from './inputs/workspaces.ts';
export default {
  'GET /container/logs': {
    schema: container.streamContainerLogsSchema,
    toRequest(input: Endpoints['GET /container/logs']['input']) {
      const endpoint = 'GET /container/logs';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [
            'projectName',
            'channelName',
            'releaseName',
            'timestamp',
            'details',
            'tail',
          ],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'DELETE /organizations/{id}': {
    schema: organizations.deleteOrgSchema,
    toRequest(input: Endpoints['DELETE /organizations/{id}']['input']) {
      const endpoint = 'DELETE /organizations/{id}';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['id'],
        }),
      );
    },
  },
  'GET /organizations': {
    schema: organizations.listOrganizationsSchema,
    toRequest(input: Endpoints['GET /organizations']['input']) {
      const endpoint = 'GET /organizations';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['pageSize', 'pageNo'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'POST /organizations': {
    schema: organizations.createOrganizationSchema,
    toRequest(input: Endpoints['POST /organizations']['input']) {
      const endpoint = 'POST /organizations';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: [],
        }),
      );
    },
  },
  'POST /organizations/default': {
    schema: organizations.createDefaultOrganizationSchema,
    toRequest(input: Endpoints['POST /organizations/default']['input']) {
      const endpoint = 'POST /organizations/default';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name', 'projectName', 'uid'],
          inputParams: [],
        }),
      );
    },
  },
  'POST /workspaces': {
    schema: workspaces.createWorkspaceSchema,
    toRequest(input: Endpoints['POST /workspaces']['input']) {
      const endpoint = 'POST /workspaces';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name', 'organizationId'],
          inputParams: [],
        }),
      );
    },
  },
  'POST /projects': {
    schema: projects.createProjectSchema,
    toRequest(input: Endpoints['POST /projects']['input']) {
      const endpoint = 'POST /projects';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: [],
        }),
      );
    },
  },
  'GET /projects': {
    schema: projects.listProjectsSchema,
    toRequest(input: Endpoints['GET /projects']['input']) {
      const endpoint = 'GET /projects';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['workspaceId', 'name', 'pageSize', 'pageNo'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'PATCH /projects/{id}': {
    schema: projects.patchProjectSchema,
    toRequest(input: Endpoints['PATCH /projects/{id}']['input']) {
      const endpoint = 'PATCH /projects/{id}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: ['id'],
        }),
      );
    },
  },
  'POST /users/link': {
    schema: users.linkUserSchema,
    toRequest(input: Endpoints['POST /users/link']['input']) {
      const endpoint = 'POST /users/link';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token', 'providerId', 'orgName', 'projectName'],
          inputParams: [],
        }),
      );
    },
  },
  'POST /users/signin': {
    schema: users.signinSchema,
    toRequest(input: Endpoints['POST /users/signin']['input']) {
      const endpoint = 'POST /users/signin';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token', 'providerId', 'source'],
          inputParams: [],
        }),
      );
    },
  },
  'GET /operations/read': {
    schema: operations.readProgressSchema,
    toRequest(input: Endpoints['GET /operations/read']['input']) {
      const endpoint = 'GET /operations/read';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['traceId'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'POST /operations/releases/start': {
    schema: operations.startReleaseSchema,
    toRequest(input: Endpoints['POST /operations/releases/start']['input']) {
      const endpoint = 'POST /operations/releases/start';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [
            'releaseName',
            'projectId',
            'projectName',
            'channel',
            'tarLocation',
            'runtimeConfig',
            'port',
            'protocol',
            'image',
            'volumes',
            'serviceName',
            'environment',
          ],
          inputParams: [],
        }),
      );
    },
  },
  'POST /operations/releases/{releaseName}/restart': {
    schema: operations.restartReleaseSchema,
    toRequest(
      input: Endpoints['POST /operations/releases/{releaseName}/restart']['input'],
    ) {
      const endpoint = 'POST /operations/releases/{releaseName}/restart';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: ['jwt'],
          inputQuery: [],
          inputBody: ['projectId', 'projectName', 'channel'],
          inputParams: ['releaseName'],
        }),
      );
    },
  },
  'POST /operations/channels/{channelName}/restart': {
    schema: operations.restartChannelSchema,
    toRequest(
      input: Endpoints['POST /operations/channels/{channelName}/restart']['input'],
    ) {
      const endpoint = 'POST /operations/channels/{channelName}/restart';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: ['jwt'],
          inputQuery: [],
          inputBody: ['projectId', 'projectName'],
          inputParams: ['channel'],
        }),
      );
    },
  },
  'DELETE /operations/releases/{releaseName}': {
    schema: operations.deleteReleaseSchema,
    toRequest(
      input: Endpoints['DELETE /operations/releases/{releaseName}']['input'],
    ) {
      const endpoint = 'DELETE /operations/releases/{releaseName}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'channel'],
          inputParams: ['releaseName'],
        }),
      );
    },
  },
  'POST /operations/releases/{releaseName}/restore': {
    schema: operations.restoreReleaseSchema,
    toRequest(
      input: Endpoints['POST /operations/releases/{releaseName}/restore']['input'],
    ) {
      const endpoint = 'POST /operations/releases/{releaseName}/restore';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'channel'],
          inputParams: ['releaseName'],
        }),
      );
    },
  },
  'POST /tokens': {
    schema: tokens.createTokenSchema,
    toRequest(input: Endpoints['POST /tokens']['input']) {
      const endpoint = 'POST /tokens';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectName'],
          inputParams: [],
        }),
      );
    },
  },
  'DELETE /tokens': {
    schema: tokens.revokeTokenSchema,
    toRequest(input: Endpoints['DELETE /tokens']['input']) {
      const endpoint = 'DELETE /tokens';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectName', 'token'],
          inputParams: [],
        }),
      );
    },
  },
  'GET /tokens': {
    schema: tokens.listTokensSchema,
    toRequest(input: Endpoints['GET /tokens']['input']) {
      const endpoint = 'GET /tokens';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['projectName'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'GET /tokens/{token}': {
    schema: tokens.getTokenSchema,
    toRequest(input: Endpoints['GET /tokens/{token}']['input']) {
      const endpoint = 'GET /tokens/{token}';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['token'],
        }),
      );
    },
  },
  'POST /tokens/exchange': {
    schema: tokens.exchangeTokenSchema,
    toRequest(input: Endpoints['POST /tokens/exchange']['input']) {
      const endpoint = 'POST /tokens/exchange';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token'],
          inputParams: [],
        }),
      );
    },
  },
  'DELETE /tokens/organization/{organizationId}': {
    schema: tokens.invalidateOrganizationTokensSchema,
    toRequest(
      input: Endpoints['DELETE /tokens/organization/{organizationId}']['input'],
    ) {
      const endpoint = 'DELETE /tokens/organization/{organizationId}';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['organizationId'],
        }),
      );
    },
  },
  'POST /releases': {
    schema: releases.createReleaseSchema,
    toRequest(input: Endpoints['POST /releases']['input']) {
      const endpoint = 'POST /releases';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['releaseName', 'projectId', 'channel'],
          inputParams: [],
        }),
      );
    },
  },
  'GET /releases': {
    schema: releases.listReleasesSchema,
    toRequest(input: Endpoints['GET /releases']['input']) {
      const endpoint = 'GET /releases';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [
            'projectId',
            'channel',
            'status',
            'conclusion',
            'pageSize',
            'pageNo',
          ],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'PATCH /releases/complete/{releaseId}': {
    schema: releases.completeReleaseSchema,
    toRequest(
      input: Endpoints['PATCH /releases/complete/{releaseId}']['input'],
    ) {
      const endpoint = 'PATCH /releases/complete/{releaseId}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['conclusion', 'containerName', 'tarLocation'],
          inputParams: ['releaseId'],
        }),
      );
    },
  },
  'PATCH /releases/{releaseId}': {
    schema: releases.patchReleaseSchema,
    toRequest(input: Endpoints['PATCH /releases/{releaseId}']['input']) {
      const endpoint = 'PATCH /releases/{releaseId}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['status', 'conclusion', 'containerName'],
          inputParams: ['releaseId'],
        }),
      );
    },
  },
  'POST /releases/{releaseId}/snapshots': {
    schema: releases.createReleaseSnapshotSchema,
    toRequest(
      input: Endpoints['POST /releases/{releaseId}/snapshots']['input'],
    ) {
      const endpoint = 'POST /releases/{releaseId}/snapshots';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: ['releaseId'],
        }),
      );
    },
  },
  'POST /secrets': {
    schema: secrets.createSecretSchema,
    toRequest(input: Endpoints['POST /secrets']['input']) {
      const endpoint = 'POST /secrets';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'channel', 'secretLabel', 'secretValue'],
          inputParams: [],
        }),
      );
    },
  },
  'GET /secrets': {
    schema: secrets.getSecretsSchema,
    toRequest(input: Endpoints['GET /secrets']['input']) {
      const endpoint = 'GET /secrets';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['projectId', 'channel'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'DELETE /secrets/{id}': {
    schema: secrets.deleteSecretSchema,
    toRequest(input: Endpoints['DELETE /secrets/{id}']['input']) {
      const endpoint = 'DELETE /secrets/{id}';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['id'],
        }),
      );
    },
  },
  'GET /secrets/values': {
    schema: secrets.getSecretsValuesSchema,
    toRequest(input: Endpoints['GET /secrets/values']['input']) {
      const endpoint = 'GET /secrets/values';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['projectId', 'channel'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
};
