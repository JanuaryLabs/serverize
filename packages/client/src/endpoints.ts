import z from 'zod';
import * as docker from './inputs/docker';
import * as management from './inputs/management';
import * as operations from './inputs/operations';
import * as projects from './inputs/projects';
import * as root from './inputs/root';
import * as stats from './inputs/stats';
import type { CompleteRelease } from './outputs/complete-release';
import type { ConfigDiscovery } from './outputs/config-discovery';
import type { CreateDefaultOrganization } from './outputs/create-default-organization';
import type { CreateOrganization } from './outputs/create-organization';
import type { CreateProject } from './outputs/create-project';
import type { CreateRelease } from './outputs/create-release';
import type { CreateReleaseSnapshot } from './outputs/create-release-snapshot';
import type { CreateSecret } from './outputs/create-secret';
import type { CreateToken } from './outputs/create-token';
import type { CreateWorkspace } from './outputs/create-workspace';
import type { DeleteOrg } from './outputs/delete-org';
import type { DeleteRelease } from './outputs/delete-release';
import type { DeleteSecret } from './outputs/delete-secret';
import type { EmptyFavicon } from './outputs/empty-favicon';
import type { ExchangeToken } from './outputs/exchange-token';
import type { GetSecrets } from './outputs/get-secrets';
import type { GetSecretsValues } from './outputs/get-secrets-values';
import type { GetToken } from './outputs/get-token';
import type { HealthCheck } from './outputs/health-check';
import type { InvalidateOrganizationTokens } from './outputs/invalidate-organization-tokens';
import type { LinkUser } from './outputs/link-user';
import type { ListOrganizations } from './outputs/list-organizations';
import type { ListProjects } from './outputs/list-projects';
import type { ListReleases } from './outputs/list-releases';
import type { ListTokens } from './outputs/list-tokens';
import type { ListUserOrganizations } from './outputs/list-user-organizations';
import type { PatchProject } from './outputs/patch-project';
import type { PatchRelease } from './outputs/patch-release';
import type { RestartChannel } from './outputs/restart-channel';
import type { RestartRelease } from './outputs/restart-release';
import type { RevokeToken } from './outputs/revoke-token';
import type { SayHi } from './outputs/say-hi';
import type { Signin } from './outputs/signin';
import type { StartRelease } from './outputs/start-release';
import type { StreamContainerLogs } from './outputs/stream-container-logs';
import type { ParseError } from './parser';
import type { ServerError } from './response';
export interface Endpoints {
  'POST /tokens': {
    input: z.infer<typeof projects.createTokenSchema>;
    output: CreateToken;
    error: ServerError | ParseError<typeof projects.createTokenSchema>;
  };
  'DELETE /tokens': {
    input: z.infer<typeof projects.revokeTokenSchema>;
    output: RevokeToken;
    error: ServerError | ParseError<typeof projects.revokeTokenSchema>;
  };
  'GET /tokens': {
    input: z.infer<typeof projects.listTokensSchema>;
    output: ListTokens;
    error: ServerError | ParseError<typeof projects.listTokensSchema>;
  };
  'GET /tokens/{token}': {
    input: z.infer<typeof projects.getTokenSchema>;
    output: GetToken;
    error: ServerError | ParseError<typeof projects.getTokenSchema>;
  };
  'POST /releases': {
    input: z.infer<typeof projects.createReleaseSchema>;
    output: CreateRelease;
    error: ServerError | ParseError<typeof projects.createReleaseSchema>;
  };
  'PATCH /releases/complete/{releaseId}': {
    input: z.infer<typeof projects.completeReleaseSchema>;
    output: CompleteRelease;
    error: ServerError | ParseError<typeof projects.completeReleaseSchema>;
  };
  'PATCH /releases/{releaseId}': {
    input: z.infer<typeof projects.patchReleaseSchema>;
    output: PatchRelease;
    error: ServerError | ParseError<typeof projects.patchReleaseSchema>;
  };
  'POST /releases/{releaseId}/snapshots': {
    input: z.infer<typeof projects.createReleaseSnapshotSchema>;
    output: CreateReleaseSnapshot;
    error:
      | ServerError
      | ParseError<typeof projects.createReleaseSnapshotSchema>;
  };
  'GET /releases': {
    input: z.infer<typeof projects.listReleasesSchema>;
    output: ListReleases;
    error: ServerError | ParseError<typeof projects.listReleasesSchema>;
  };
  'POST /secrets': {
    input: z.infer<typeof projects.createSecretSchema>;
    output: CreateSecret;
    error: ServerError | ParseError<typeof projects.createSecretSchema>;
  };
  'GET /secrets': {
    input: z.infer<typeof projects.getSecretsSchema>;
    output: GetSecrets;
    error: ServerError | ParseError<typeof projects.getSecretsSchema>;
  };
  'DELETE /secrets/{id}': {
    input: z.infer<typeof projects.deleteSecretSchema>;
    output: DeleteSecret;
    error: ServerError | ParseError<typeof projects.deleteSecretSchema>;
  };
  'GET /secrets/values': {
    input: z.infer<typeof projects.getSecretsValuesSchema>;
    output: GetSecretsValues;
    error: ServerError | ParseError<typeof projects.getSecretsValuesSchema>;
  };
  'POST /tokens/exchange': {
    input: z.infer<typeof projects.exchangeTokenSchema>;
    output: ExchangeToken;
    error: ServerError | ParseError<typeof projects.exchangeTokenSchema>;
  };
  'DELETE /tokens/organization/{organizationId}': {
    input: z.infer<typeof projects.invalidateOrganizationTokensSchema>;
    output: InvalidateOrganizationTokens;
    error:
      | ServerError
      | ParseError<typeof projects.invalidateOrganizationTokensSchema>;
  };
  'GET /root/favicon.ico': {
    input: z.infer<typeof root.emptyFaviconSchema>;
    output: EmptyFavicon;
    error: ServerError | ParseError<typeof root.emptyFaviconSchema>;
  };
  'GET /root': {
    input: z.infer<typeof root.sayHiSchema>;
    output: SayHi;
    error: ServerError | ParseError<typeof root.sayHiSchema>;
  };
  'GET /root/health': {
    input: z.infer<typeof root.healthCheckSchema>;
    output: HealthCheck;
    error: ServerError | ParseError<typeof root.healthCheckSchema>;
  };
  'DELETE /organizations/{id}': {
    input: z.infer<typeof management.deleteOrgSchema>;
    output: DeleteOrg;
    error: ServerError | ParseError<typeof management.deleteOrgSchema>;
  };
  'GET /organizations': {
    input: z.infer<typeof management.listOrganizationsSchema>;
    output: ListOrganizations;
    error: ServerError | ParseError<typeof management.listOrganizationsSchema>;
  };
  'POST /organizations/default': {
    input: z.infer<typeof management.createDefaultOrganizationSchema>;
    output: CreateDefaultOrganization;
    error:
      | ServerError
      | ParseError<typeof management.createDefaultOrganizationSchema>;
  };
  'POST /organizations': {
    input: z.infer<typeof management.createOrganizationSchema>;
    output: CreateOrganization;
    error: ServerError | ParseError<typeof management.createOrganizationSchema>;
  };
  'POST /workspaces': {
    input: z.infer<typeof management.createWorkspaceSchema>;
    output: CreateWorkspace;
    error: ServerError | ParseError<typeof management.createWorkspaceSchema>;
  };
  'POST /projects': {
    input: z.infer<typeof management.createProjectSchema>;
    output: CreateProject;
    error: ServerError | ParseError<typeof management.createProjectSchema>;
  };
  'PATCH /projects/{id}': {
    input: z.infer<typeof management.patchProjectSchema>;
    output: PatchProject;
    error: ServerError | ParseError<typeof management.patchProjectSchema>;
  };
  'GET /projects': {
    input: z.infer<typeof management.listProjectsSchema>;
    output: ListProjects;
    error: ServerError | ParseError<typeof management.listProjectsSchema>;
  };
  'GET /users/organizations': {
    input: z.infer<typeof management.listUserOrganizationsSchema>;
    output: ListUserOrganizations;
    error:
      | ServerError
      | ParseError<typeof management.listUserOrganizationsSchema>;
  };
  'POST /users/link': {
    input: z.infer<typeof management.linkUserSchema>;
    output: LinkUser;
    error: ServerError | ParseError<typeof management.linkUserSchema>;
  };
  'POST /users/signin': {
    input: z.infer<typeof management.signinSchema>;
    output: Signin;
    error: ServerError | ParseError<typeof management.signinSchema>;
  };
  'POST /operations/releases/start': {
    input: z.infer<typeof operations.startReleaseSchema>;
    output: StartRelease;
    error: ServerError | ParseError<typeof operations.startReleaseSchema>;
  };
  'POST /operations/releases/{releaseName}/restart': {
    input: z.infer<typeof operations.restartReleaseSchema>;
    output: RestartRelease;
    error: ServerError | ParseError<typeof operations.restartReleaseSchema>;
  };
  'POST /operations/channels/{channelName}/restart': {
    input: z.infer<typeof operations.restartChannelSchema>;
    output: RestartChannel;
    error: ServerError | ParseError<typeof operations.restartChannelSchema>;
  };
  'DELETE /operations/releases/{releaseName}': {
    input: z.infer<typeof operations.deleteReleaseSchema>;
    output: DeleteRelease;
    error: ServerError | ParseError<typeof operations.deleteReleaseSchema>;
  };
  'GET /container/logs': {
    input: z.infer<typeof docker.streamContainerLogsSchema>;
    output: StreamContainerLogs;
    error: ServerError | ParseError<typeof docker.streamContainerLogsSchema>;
  };
  'GET /containers/discovery': {
    input: z.infer<typeof docker.configDiscoverySchema>;
    output: ConfigDiscovery;
    error: ServerError | ParseError<typeof docker.configDiscoverySchema>;
  };
}
