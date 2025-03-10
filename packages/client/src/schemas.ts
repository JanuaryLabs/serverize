import z from 'zod';
import type { Endpoints } from './endpoints.ts';
import type { ParseError } from './http/parser.ts';
import {
  createUrl,
  formdata,
  json,
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
    toRequest(
      input: Endpoints['GET /container/logs']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'GET /container/logs';
      return toRequest(
        endpoint,
        json(input, {
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
        init,
      );
    },
  },
  'DELETE /organizations/{id}': {
    schema: organizations.deleteOrgSchema,
    toRequest(
      input: Endpoints['DELETE /organizations/{id}']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'DELETE /organizations/{id}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['id'],
        }),
        init,
      );
    },
  },
  'GET /organizations': {
    schema: organizations.listOrganizationsSchema,
    toRequest(
      input: Endpoints['GET /organizations']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'GET /organizations';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: ['pageSize', 'pageNo'],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'POST /organizations': {
    schema: organizations.createOrganizationSchema,
    toRequest(
      input: Endpoints['POST /organizations']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /organizations';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'POST /organizations/default': {
    schema: organizations.createDefaultOrganizationSchema,
    toRequest(
      input: Endpoints['POST /organizations/default']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /organizations/default';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'POST /workspaces': {
    schema: workspaces.createWorkspaceSchema,
    toRequest(
      input: Endpoints['POST /workspaces']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /workspaces';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'POST /projects': {
    schema: projects.createProjectSchema,
    toRequest(
      input: Endpoints['POST /projects']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /projects';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'GET /projects': {
    schema: projects.listProjectsSchema,
    toRequest(
      input: Endpoints['GET /projects']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'GET /projects';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: ['workspaceId', 'name', 'pageSize', 'pageNo'],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'PATCH /projects/{id}': {
    schema: projects.patchProjectSchema,
    toRequest(
      input: Endpoints['PATCH /projects/{id}']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'PATCH /projects/{id}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['id'],
        }),
        init,
      );
    },
  },
  'POST /users/link': {
    schema: users.linkUserSchema,
    toRequest(
      input: Endpoints['POST /users/link']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /users/link';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'POST /users/signin': {
    schema: users.signinSchema,
    toRequest(
      input: Endpoints['POST /users/signin']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /users/signin';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'POST /operations/releases/start': {
    schema: operations.startReleaseSchema,
    toRequest(
      input: Endpoints['POST /operations/releases/start']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /operations/releases/start';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: ['jwt'],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'POST /operations/releases/{releaseName}/restart': {
    schema: operations.restartReleaseSchema,
    toRequest(
      input: Endpoints['POST /operations/releases/{releaseName}/restart']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /operations/releases/{releaseName}/restart';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: ['jwt'],
          inputQuery: [],
          inputBody: [],
          inputParams: ['releaseName'],
        }),
        init,
      );
    },
  },
  'POST /operations/channels/{channelName}/restart': {
    schema: operations.restartChannelSchema,
    toRequest(
      input: Endpoints['POST /operations/channels/{channelName}/restart']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /operations/channels/{channelName}/restart';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: ['jwt'],
          inputQuery: [],
          inputBody: [],
          inputParams: ['channel'],
        }),
        init,
      );
    },
  },
  'DELETE /operations/releases/{releaseName}': {
    schema: operations.deleteReleaseSchema,
    toRequest(
      input: Endpoints['DELETE /operations/releases/{releaseName}']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'DELETE /operations/releases/{releaseName}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['releaseName'],
        }),
        init,
      );
    },
  },
  'POST /operations/releases/{releaseName}/restore': {
    schema: operations.restoreReleaseSchema,
    toRequest(
      input: Endpoints['POST /operations/releases/{releaseName}/restore']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /operations/releases/{releaseName}/restore';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['releaseName'],
        }),
        init,
      );
    },
  },
  'POST /tokens': {
    schema: tokens.createTokenSchema,
    toRequest(
      input: Endpoints['POST /tokens']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /tokens';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'DELETE /tokens': {
    schema: tokens.revokeTokenSchema,
    toRequest(
      input: Endpoints['DELETE /tokens']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'DELETE /tokens';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'GET /tokens': {
    schema: tokens.listTokensSchema,
    toRequest(
      input: Endpoints['GET /tokens']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'GET /tokens';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: ['projectName'],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'GET /tokens/{token}': {
    schema: tokens.getTokenSchema,
    toRequest(
      input: Endpoints['GET /tokens/{token}']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'GET /tokens/{token}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['token'],
        }),
        init,
      );
    },
  },
  'POST /tokens/exchange': {
    schema: tokens.exchangeTokenSchema,
    toRequest(
      input: Endpoints['POST /tokens/exchange']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /tokens/exchange';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'DELETE /tokens/organization/{organizationId}': {
    schema: tokens.invalidateOrganizationTokensSchema,
    toRequest(
      input: Endpoints['DELETE /tokens/organization/{organizationId}']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'DELETE /tokens/organization/{organizationId}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['organizationId'],
        }),
        init,
      );
    },
  },
  'POST /releases': {
    schema: releases.createReleaseSchema,
    toRequest(
      input: Endpoints['POST /releases']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /releases';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'GET /releases': {
    schema: releases.listReleasesSchema,
    toRequest(
      input: Endpoints['GET /releases']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'GET /releases';
      return toRequest(
        endpoint,
        json(input, {
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
        init,
      );
    },
  },
  'PATCH /releases/complete/{releaseId}': {
    schema: releases.completeReleaseSchema,
    toRequest(
      input: Endpoints['PATCH /releases/complete/{releaseId}']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'PATCH /releases/complete/{releaseId}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['releaseId'],
        }),
        init,
      );
    },
  },
  'PATCH /releases/{releaseId}': {
    schema: releases.patchReleaseSchema,
    toRequest(
      input: Endpoints['PATCH /releases/{releaseId}']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'PATCH /releases/{releaseId}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['releaseId'],
        }),
        init,
      );
    },
  },
  'POST /releases/{releaseId}/snapshots': {
    schema: releases.createReleaseSnapshotSchema,
    toRequest(
      input: Endpoints['POST /releases/{releaseId}/snapshots']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /releases/{releaseId}/snapshots';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['releaseId'],
        }),
        init,
      );
    },
  },
  'POST /secrets': {
    schema: secrets.createSecretSchema,
    toRequest(
      input: Endpoints['POST /secrets']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'POST /secrets';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'GET /secrets': {
    schema: secrets.getSecretsSchema,
    toRequest(
      input: Endpoints['GET /secrets']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'GET /secrets';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: ['projectId', 'channel'],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
  'DELETE /secrets/{id}': {
    schema: secrets.deleteSecretSchema,
    toRequest(
      input: Endpoints['DELETE /secrets/{id}']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'DELETE /secrets/{id}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['id'],
        }),
        init,
      );
    },
  },
  'GET /secrets/values': {
    schema: secrets.getSecretsValuesSchema,
    toRequest(
      input: Endpoints['GET /secrets/values']['input'],
      init: { baseUrl: string; headers?: Partial<Record<string, string>> },
    ) {
      const endpoint = 'GET /secrets/values';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: ['projectId', 'channel'],
          inputBody: [],
          inputParams: [],
        }),
        init,
      );
    },
  },
};
