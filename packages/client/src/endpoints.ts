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
import { TerminateRelease } from './outputs/TerminateRelease';

export interface Endpoints {
  'DELETE /organizations/{id}': {
    input: z.infer<typeof management.deleteOrgSchema>;
    output: DeleteOrg;
  };
  'GET /organizations': {
    input: z.infer<typeof management.listOrganizationsSchema>;
    output: ListOrganizations;
  };
  'POST /organizations/default': {
    input: z.infer<typeof management.createDefaultOrganizationSchema>;
    output: CreateDefaultOrganization;
  };
  'POST /organizations': {
    input: z.infer<typeof management.createOrganizationSchema>;
    output: CreateOrganization;
  };
  'POST /workspaces': {
    input: z.infer<typeof management.createWorkspaceSchema>;
    output: CreateWorkspace;
  };
  'POST /projects': {
    input: z.infer<typeof management.createProjectSchema>;
    output: CreateProject;
  };
  'PATCH /projects/{id}': {
    input: z.infer<typeof management.patchProjectSchema>;
    output: PatchProject;
  };
  'GET /projects': {
    input: z.infer<typeof management.listProjectsSchema>;
    output: ListProjects;
  };
  'GET /users/organizations': {
    input: z.infer<typeof management.listUserOrganizationsSchema>;
    output: ListUserOrganizations;
  };
  'POST /users/link': {
    input: z.infer<typeof management.linkUserSchema>;
    output: LinkUser;
  };
  'POST /users/signin': {
    input: z.infer<typeof management.signinSchema>;
    output: Signin;
  };
  'POST /operations/releases/start': {
    input: z.infer<typeof operations.startReleaseSchema>;
    output: StartRelease;
  };
  'POST /operations/releases/{releaseName}/restart': {
    input: z.infer<typeof operations.restartReleaseSchema>;
    output: RestartRelease;
  };
  'POST /operations/channels/{channelName}/restart': {
    input: z.infer<typeof operations.restartChannelSchema>;
    output: RestartChannel;
  };
  'GET /operations/config': {
    input: z.infer<typeof operations.getConfigSchema>;
    output: GetConfig;
  };
  'POST /tokens': {
    input: z.infer<typeof projects.createTokenSchema>;
    output: CreateToken;
  };
  'DELETE /tokens': {
    input: z.infer<typeof projects.revokeTokenSchema>;
    output: RevokeToken;
  };
  'GET /tokens': {
    input: z.infer<typeof projects.listTokensSchema>;
    output: ListTokens;
  };
  'GET /tokens/{id}': {
    input: z.infer<typeof projects.getTokenSchema>;
    output: GetToken;
  };
  'POST /releases': {
    input: z.infer<typeof projects.createReleaseSchema>;
    output: CreateRelease;
  };
  'PATCH /releases/complete/{releaseId}': {
    input: z.infer<typeof projects.completeReleaseSchema>;
    output: CompleteRelease;
  };
  'PATCH /releases/{releaseId}': {
    input: z.infer<typeof projects.patchReleaseSchema>;
    output: PatchRelease;
  };
  'POST /releases/{releaseId}/snapshots': {
    input: z.infer<typeof projects.createReleaseSnapshotSchema>;
    output: CreateReleaseSnapshot;
  };
  'GET /releases': {
    input: z.infer<typeof projects.listReleasesSchema>;
    output: ListReleases;
  };
  'DELETE /releases': {
    input: z.infer<typeof projects.terminateReleaseSchema>;
    output: TerminateRelease;
  };
  'POST /secrets': {
    input: z.infer<typeof projects.createSecretSchema>;
    output: CreateSecret;
  };
  'GET /secrets': {
    input: z.infer<typeof projects.getSecretsSchema>;
    output: GetSecrets;
  };
  'DELETE /secrets/{id}': {
    input: z.infer<typeof projects.deleteSecretSchema>;
    output: DeleteSecret;
  };
  'GET /secrets/values': {
    input: z.infer<typeof projects.getSecretsValuesSchema>;
    output: GetSecretsValues;
  };
  'GET /root/favicon.ico': {
    input: z.infer<typeof root.emptyFaviconSchema>;
    output: EmptyFavicon;
  };
  'GET /root': { input: z.infer<typeof root.sayHiSchema>; output: SayHi };
  'GET /root/health': {
    input: z.infer<typeof root.healthCheckSchema>;
    output: HealthCheck;
  };
}
