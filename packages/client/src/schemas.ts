import z from 'zod';
import type { Endpoints } from './endpoints';
import * as docker from './inputs/docker';
import * as management from './inputs/management';
import * as operations from './inputs/operations';
import * as projects from './inputs/projects';
import * as root from './inputs/root';
import { createUrl, toRequest } from './request';
import type { StreamEndpoints } from './stream-endpoints';
export default {
  'GET /container/logs': {
    schema: docker.streamContainerLogsSchema,
    toRequest(
      input: StreamEndpoints['GET /container/logs']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /container/logs';
      return toRequest(
        endpoint,
        input,
        {
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
        },
        init,
      );
    },
  },
  'DELETE /organizations/{id}': {
    schema: management.deleteOrgSchema,
    toRequest(
      input: Endpoints['DELETE /organizations/{id}']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'DELETE /organizations/{id}';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['id'],
        },
        init,
      );
    },
  },
  'GET /organizations': {
    schema: management.listOrganizationsSchema,
    toRequest(
      input: Endpoints['GET /organizations']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /organizations';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: ['pageSize', 'pageNo'],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /organizations/default': {
    schema: management.createDefaultOrganizationSchema,
    toRequest(
      input: Endpoints['POST /organizations/default']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /organizations/default';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name', 'projectName', 'uid'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /organizations': {
    schema: management.createOrganizationSchema,
    toRequest(
      input: Endpoints['POST /organizations']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /organizations';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /workspaces': {
    schema: management.createWorkspaceSchema,
    toRequest(
      input: Endpoints['POST /workspaces']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /workspaces';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name', 'organizationId'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /projects': {
    schema: management.createProjectSchema,
    toRequest(
      input: Endpoints['POST /projects']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /projects';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'PATCH /projects/{id}': {
    schema: management.patchProjectSchema,
    toRequest(
      input: Endpoints['PATCH /projects/{id}']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'PATCH /projects/{id}';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: ['id'],
        },
        init,
      );
    },
  },
  'GET /projects': {
    schema: management.listProjectsSchema,
    toRequest(
      input: Endpoints['GET /projects']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /projects';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: ['workspaceId', 'name', 'pageSize', 'pageNo'],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'GET /users/organizations': {
    schema: management.listUserOrganizationsSchema,
    toRequest(
      input: Endpoints['GET /users/organizations']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /users/organizations';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /users/link': {
    schema: management.linkUserSchema,
    toRequest(
      input: Endpoints['POST /users/link']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /users/link';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token', 'providerId', 'orgName', 'projectName'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /users/signin': {
    schema: management.signinSchema,
    toRequest(
      input: Endpoints['POST /users/signin']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /users/signin';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token', 'providerId'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /operations/releases/start': {
    schema: operations.startReleaseSchema,
    toRequest(
      input: Endpoints['POST /operations/releases/start']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /operations/releases/start';
      return toRequest(
        endpoint,
        input,
        {
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
            'image',
            'volumes',
            'serviceName',
            'environment',
          ],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /operations/releases/{releaseName}/restart': {
    schema: operations.restartReleaseSchema,
    toRequest(
      input: Endpoints['POST /operations/releases/{releaseName}/restart']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /operations/releases/{releaseName}/restart';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'projectName', 'channel'],
          inputParams: ['releaseName'],
        },
        init,
      );
    },
  },
  'POST /operations/channels/{channelName}/restart': {
    schema: operations.restartChannelSchema,
    toRequest(
      input: Endpoints['POST /operations/channels/{channelName}/restart']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /operations/channels/{channelName}/restart';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'projectName'],
          inputParams: ['channel'],
        },
        init,
      );
    },
  },
  'GET /operations/config': {
    schema: operations.getConfigSchema,
    toRequest(
      input: Endpoints['GET /operations/config']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /operations/config';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'POST /tokens': {
    schema: projects.createTokenSchema,
    toRequest(
      input: Endpoints['POST /tokens']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /tokens';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'DELETE /tokens': {
    schema: projects.revokeTokenSchema,
    toRequest(
      input: Endpoints['DELETE /tokens']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'DELETE /tokens';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'GET /tokens': {
    schema: projects.listTokensSchema,
    toRequest(
      input: Endpoints['GET /tokens']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /tokens';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'GET /tokens/{id}': {
    schema: projects.getTokenSchema,
    toRequest(
      input: Endpoints['GET /tokens/{id}']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /tokens/{id}';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['token'],
        },
        init,
      );
    },
  },
  'POST /releases': {
    schema: projects.createReleaseSchema,
    toRequest(
      input: Endpoints['POST /releases']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /releases';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['releaseName', 'projectId', 'channel'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'PATCH /releases/complete/{releaseId}': {
    schema: projects.completeReleaseSchema,
    toRequest(
      input: Endpoints['PATCH /releases/complete/{releaseId}']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'PATCH /releases/complete/{releaseId}';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['conclusion', 'containerName', 'tarLocation'],
          inputParams: ['releaseId'],
        },
        init,
      );
    },
  },
  'PATCH /releases/{releaseId}': {
    schema: projects.patchReleaseSchema,
    toRequest(
      input: Endpoints['PATCH /releases/{releaseId}']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'PATCH /releases/{releaseId}';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['status', 'conclusion', 'containerName'],
          inputParams: ['releaseId'],
        },
        init,
      );
    },
  },
  'POST /releases/{releaseId}/snapshots': {
    schema: projects.createReleaseSnapshotSchema,
    toRequest(
      input: Endpoints['POST /releases/{releaseId}/snapshots']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /releases/{releaseId}/snapshots';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: ['releaseId'],
        },
        init,
      );
    },
  },
  'GET /releases': {
    schema: projects.listReleasesSchema,
    toRequest(
      input: Endpoints['GET /releases']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /releases';
      return toRequest(
        endpoint,
        input,
        {
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
        },
        init,
      );
    },
  },
  'DELETE /releases': {
    schema: projects.terminateReleaseSchema,
    toRequest(
      input: Endpoints['DELETE /releases']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'DELETE /releases';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: ['projectId'],
          inputBody: [],
          inputParams: ['releaseName', 'channelName'],
        },
        init,
      );
    },
  },
  'POST /secrets': {
    schema: projects.createSecretSchema,
    toRequest(
      input: Endpoints['POST /secrets']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'POST /secrets';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'channel', 'secretLabel', 'secretValue'],
          inputParams: [],
        },
        init,
      );
    },
  },
  'GET /secrets': {
    schema: projects.getSecretsSchema,
    toRequest(
      input: Endpoints['GET /secrets']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /secrets';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: ['projectId', 'channel'],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'DELETE /secrets/{id}': {
    schema: projects.deleteSecretSchema,
    toRequest(
      input: Endpoints['DELETE /secrets/{id}']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'DELETE /secrets/{id}';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['id'],
        },
        init,
      );
    },
  },
  'GET /secrets/values': {
    schema: projects.getSecretsValuesSchema,
    toRequest(
      input: Endpoints['GET /secrets/values']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /secrets/values';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: ['projectId', 'channel'],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'GET /root/favicon.ico': {
    schema: root.emptyFaviconSchema,
    toRequest(
      input: Endpoints['GET /root/favicon.ico']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /root/favicon.ico';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'GET /root': {
    schema: root.sayHiSchema,
    toRequest(
      input: Endpoints['GET /root']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /root';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
  'GET /root/health': {
    schema: root.healthCheckSchema,
    toRequest(
      input: Endpoints['GET /root/health']['input'],
      init: { baseUrl: string; headers?: Record<string, string> },
    ) {
      const endpoint = 'GET /root/health';
      return toRequest(
        endpoint,
        input,
        {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: [],
        },
        init,
      );
    },
  },
};
