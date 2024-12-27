import z from 'zod';
import * as docker from './inputs/docker';
import * as management from './inputs/management';
import {DeleteOrg} from './outputs/DeleteOrg';
import {ListOrganizations} from './outputs/ListOrganizations';
import {CreateDefaultOrganization} from './outputs/CreateDefaultOrganization';
import {CreateOrganization} from './outputs/CreateOrganization';
import {CreateWorkspace} from './outputs/CreateWorkspace';
import {CreateProject} from './outputs/CreateProject';
import {PatchProject} from './outputs/PatchProject';
import {ListProjects} from './outputs/ListProjects';
import {ListUserOrganizations} from './outputs/ListUserOrganizations';
import {LinkUser} from './outputs/LinkUser';
import {Signin} from './outputs/Signin';
import * as operations from './inputs/operations';
import {StartRelease} from './outputs/StartRelease';
import {RestartRelease} from './outputs/RestartRelease';
import {RestartChannel} from './outputs/RestartChannel';
import {GetConfig} from './outputs/GetConfig';
import * as projects from './inputs/projects';
import {CreateToken} from './outputs/CreateToken';
import {RevokeToken} from './outputs/RevokeToken';
import {ListTokens} from './outputs/ListTokens';
import {GetToken} from './outputs/GetToken';
import {CreateRelease} from './outputs/CreateRelease';
import {CompleteRelease} from './outputs/CompleteRelease';
import {PatchRelease} from './outputs/PatchRelease';
import {CreateReleaseSnapshot} from './outputs/CreateReleaseSnapshot';
import {ListReleases} from './outputs/ListReleases';
import {TerminateRelease} from './outputs/TerminateRelease';
import {CreateSecret} from './outputs/CreateSecret';
import {GetSecrets} from './outputs/GetSecrets';
import {GetSecretsValues} from './outputs/GetSecretsValues';
import * as root from './inputs/root';
import {EmptyFavicon} from './outputs/EmptyFavicon';
import {SayHi} from './outputs/SayHi';
import {HealthCheck} from './outputs/HealthCheck';
export interface Endpoints {
  "DELETE /organizations/{id}": {input: z.infer<typeof management.deleteOrgSchema>, output: DeleteOrg};
  "GET /organizations": {input: z.infer<typeof management.listOrganizationsSchema>, output: ListOrganizations};
  "POST /organizations/default": {input: z.infer<typeof management.createDefaultOrganizationSchema>, output: CreateDefaultOrganization};
  "POST /organizations": {input: z.infer<typeof management.createOrganizationSchema>, output: CreateOrganization};
  "POST /workspaces": {input: z.infer<typeof management.createWorkspaceSchema>, output: CreateWorkspace};
  "POST /projects": {input: z.infer<typeof management.createProjectSchema>, output: CreateProject};
  "PATCH /projects/{id}": {input: z.infer<typeof management.patchProjectSchema>, output: PatchProject};
  "GET /projects": {input: z.infer<typeof management.listProjectsSchema>, output: ListProjects};
  "GET /users/organizations": {input: z.infer<typeof management.listUserOrganizationsSchema>, output: ListUserOrganizations};
  "POST /users/link": {input: z.infer<typeof management.linkUserSchema>, output: LinkUser};
  "POST /users/signin": {input: z.infer<typeof management.signinSchema>, output: Signin};
  "POST /operations/releases/start": {input: z.infer<typeof operations.startReleaseSchema>, output: StartRelease};
  "POST /operations/releases/{releaseName}/restart": {input: z.infer<typeof operations.restartReleaseSchema>, output: RestartRelease};
  "POST /operations/channels/{channelName}/restart": {input: z.infer<typeof operations.restartChannelSchema>, output: RestartChannel};
  "GET /operations/config": {input: z.infer<typeof operations.getConfigSchema>, output: GetConfig};
  "POST /tokens": {input: z.infer<typeof projects.createTokenSchema>, output: CreateToken};
  "DELETE /tokens": {input: z.infer<typeof projects.revokeTokenSchema>, output: RevokeToken};
  "GET /tokens": {input: z.infer<typeof projects.listTokensSchema>, output: ListTokens};
  "GET /tokens/{id}": {input: z.infer<typeof projects.getTokenSchema>, output: GetToken};
  "POST /releases": {input: z.infer<typeof projects.createReleaseSchema>, output: CreateRelease};
  "PATCH /releases/complete/{releaseId}": {input: z.infer<typeof projects.completeReleaseSchema>, output: CompleteRelease};
  "PATCH /releases/{releaseId}": {input: z.infer<typeof projects.patchReleaseSchema>, output: PatchRelease};
  "POST /releases/{releaseId}/snapshots": {input: z.infer<typeof projects.createReleaseSnapshotSchema>, output: CreateReleaseSnapshot};
  "GET /releases": {input: z.infer<typeof projects.listReleasesSchema>, output: ListReleases};
  "DELETE /releases": {input: z.infer<typeof projects.terminateReleaseSchema>, output: TerminateRelease};
  "POST /secrets": {input: z.infer<typeof projects.createSecretSchema>, output: CreateSecret};
  "GET /secrets": {input: z.infer<typeof projects.getSecretsSchema>, output: GetSecrets};
  "GET /secrets/values": {input: z.infer<typeof projects.getSecretsValuesSchema>, output: GetSecretsValues};
  "GET /root/favicon.ico": {input: z.infer<typeof root.emptyFaviconSchema>, output: EmptyFavicon};
  "GET /root": {input: z.infer<typeof root.sayHiSchema>, output: SayHi};
  "GET /root/health": {input: z.infer<typeof root.healthCheckSchema>, output: HealthCheck};
}