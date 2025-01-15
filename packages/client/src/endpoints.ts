import z from 'zod';
import * as docker from './inputs/docker';
import * as management from './inputs/management';
import * as operations from './inputs/operations';
import * as projects from './inputs/projects';
import * as root from './inputs/root';
import { CompleteRelease } from './outputs/CompleteRelease';
import { CreateDefaultOrganization } from './outputs/CreateDefaultOrganization';
import { CreateOrganization } from './outputs/CreateOrganization';
import { CreateProject } from './outputs/CreateProject';
import { CreateRelease } from './outputs/CreateRelease';
import { CreateReleaseSnapshot } from './outputs/CreateReleaseSnapshot';
import { CreateSecret } from './outputs/CreateSecret';
import { CreateToken } from './outputs/CreateToken';
import { CreateWorkspace } from './outputs/CreateWorkspace';
import { DeleteOrg } from './outputs/DeleteOrg';
import { DeleteRelease } from './outputs/DeleteRelease';
import { DeleteSecret } from './outputs/DeleteSecret';
import { EmptyFavicon } from './outputs/EmptyFavicon';
import { GetConfig } from './outputs/GetConfig';
import { GetSecrets } from './outputs/GetSecrets';
import { GetSecretsValues } from './outputs/GetSecretsValues';
import { GetToken } from './outputs/GetToken';
import { HealthCheck } from './outputs/HealthCheck';
import { LinkUser } from './outputs/LinkUser';
import { ListOrganizations } from './outputs/ListOrganizations';
import { ListProjects } from './outputs/ListProjects';
import { ListReleases } from './outputs/ListReleases';
import { ListTokens } from './outputs/ListTokens';
import { ListUserOrganizations } from './outputs/ListUserOrganizations';
import { PatchProject } from './outputs/PatchProject';
import { PatchRelease } from './outputs/PatchRelease';
import { RestartChannel } from './outputs/RestartChannel';
import { RestartRelease } from './outputs/RestartRelease';
import { RevokeToken } from './outputs/RevokeToken';
import { SayHi } from './outputs/SayHi';
import { Signin } from './outputs/Signin';
import { StartRelease } from './outputs/StartRelease';
import { StreamContainerLogs } from './outputs/StreamContainerLogs';
import { TerminateRelease } from './outputs/TerminateRelease';
import type { ParseError } from './parser';
import type { ServerError } from './response';
export interface Endpoints {
  'GET /container/logs': {
    input: z.infer<typeof docker.streamContainerLogsSchema>;
    output: StreamContainerLogs;
    error: ServerError | ParseError<typeof docker.streamContainerLogsSchema>;
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
  'GET /operations/config': {
    input: z.infer<typeof operations.getConfigSchema>;
    output: GetConfig;
    error: ServerError | ParseError<typeof operations.getConfigSchema>;
  };
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
  'DELETE /releases': {
    input: z.infer<typeof projects.terminateReleaseSchema>;
    output: TerminateRelease;
    error: ServerError | ParseError<typeof projects.terminateReleaseSchema>;
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
}
