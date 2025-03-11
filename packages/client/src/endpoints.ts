import z from 'zod';
import type { ParseError } from './http/parser.ts';
import type {
  BadRequest,
  Conflict,
  NotFound,
  ProblematicResponse,
  ServerError,
  Unauthorized,
} from './http/response.ts';
import * as container from './inputs/container.ts';
import * as operations from './inputs/operations.ts';
import * as organizations from './inputs/organizations.ts';
import * as projects from './inputs/projects.ts';
import * as releases from './inputs/releases.ts';
import * as secrets from './inputs/secrets.ts';
import * as tokens from './inputs/tokens.ts';
import * as users from './inputs/users.ts';
import * as workspaces from './inputs/workspaces.ts';
import type { CompleteReleaseOutput } from './outputs/complete-release.ts';
import type { CreateDefaultOrganizationOutput } from './outputs/create-default-organization.ts';
import type { CreateOrganizationOutput } from './outputs/create-organization.ts';
import type { CreateProjectOutput } from './outputs/create-project.ts';
import type { CreateReleaseSnapshotOutput } from './outputs/create-release-snapshot.ts';
import type { CreateReleaseOutput } from './outputs/create-release.ts';
import type { CreateSecretOutput } from './outputs/create-secret.ts';
import type { CreateTokenOutput } from './outputs/create-token.ts';
import type { CreateWorkspaceOutput } from './outputs/create-workspace.ts';
import type { DeleteOrgOutput } from './outputs/delete-org.ts';
import type { DeleteReleaseOutput } from './outputs/delete-release.ts';
import type { DeleteSecretOutput } from './outputs/delete-secret.ts';
import type { ExchangeTokenOutput } from './outputs/exchange-token.ts';
import type { GetSecretsValuesOutput } from './outputs/get-secrets-values.ts';
import type { GetSecretsOutput } from './outputs/get-secrets.ts';
import type { GetTokenOutput } from './outputs/get-token.ts';
import type { InvalidateOrganizationTokensOutput } from './outputs/invalidate-organization-tokens.ts';
import type { LinkUserOutput } from './outputs/link-user.ts';
import type { ListOrganizationsOutput } from './outputs/list-organizations.ts';
import type { ListProjectsOutput } from './outputs/list-projects.ts';
import type { ListReleasesOutput } from './outputs/list-releases.ts';
import type { ListTokensOutput } from './outputs/list-tokens.ts';
import type { PatchProjectOutput } from './outputs/patch-project.ts';
import type { PatchReleaseOutput } from './outputs/patch-release.ts';
import type { RestartChannelOutput } from './outputs/restart-channel.ts';
import type { RestartReleaseOutput } from './outputs/restart-release.ts';
import type { RestoreReleaseOutput } from './outputs/restore-release.ts';
import type { RevokeTokenOutput } from './outputs/revoke-token.ts';
import type { SigninOutput } from './outputs/signin.ts';
import type { StartReleaseOutput } from './outputs/start-release.ts';
import type { StreamContainerLogsOutput } from './outputs/stream-container-logs.ts';
export interface Endpoints {
  'GET /container/logs': {
    input: z.infer<typeof container.streamContainerLogsSchema>;
    output: StreamContainerLogsOutput;
    error: ServerError | ParseError<typeof container.streamContainerLogsSchema>;
  };
  'DELETE /organizations/{id}': {
    input: z.infer<typeof organizations.deleteOrgSchema>;
    output: DeleteOrgOutput;
    error: ServerError | ParseError<typeof organizations.deleteOrgSchema>;
  };
  'GET /organizations': {
    input: z.infer<typeof organizations.listOrganizationsSchema>;
    output: ListOrganizationsOutput;
    error:
      | ServerError
      | ParseError<typeof organizations.listOrganizationsSchema>;
  };
  'POST /organizations': {
    input: z.infer<typeof organizations.createOrganizationSchema>;
    output: CreateOrganizationOutput;
    error:
      | ServerError
      | ParseError<typeof organizations.createOrganizationSchema>;
  };
  'POST /organizations/default': {
    input: z.infer<typeof organizations.createDefaultOrganizationSchema>;
    output: CreateDefaultOrganizationOutput;
    error:
      | ServerError
      | ParseError<typeof organizations.createDefaultOrganizationSchema>;
  };
  'POST /workspaces': {
    input: z.infer<typeof workspaces.createWorkspaceSchema>;
    output: CreateWorkspaceOutput;
    error: ServerError | ParseError<typeof workspaces.createWorkspaceSchema>;
  };
  'POST /projects': {
    input: z.infer<typeof projects.createProjectSchema>;
    output: CreateProjectOutput;
    error: ServerError | ParseError<typeof projects.createProjectSchema>;
  };
  'GET /projects': {
    input: z.infer<typeof projects.listProjectsSchema>;
    output: ListProjectsOutput;
    error: ServerError | ParseError<typeof projects.listProjectsSchema>;
  };
  'PATCH /projects/{id}': {
    input: z.infer<typeof projects.patchProjectSchema>;
    output: PatchProjectOutput;
    error: ServerError | ParseError<typeof projects.patchProjectSchema>;
  };
  'POST /users/link': {
    input: z.infer<typeof users.linkUserSchema>;
    output: LinkUserOutput;
    error:
      | ProblematicResponse
      | Conflict
      | ParseError<typeof users.linkUserSchema>;
  };
  'POST /users/signin': {
    input: z.infer<typeof users.signinSchema>;
    output: SigninOutput;
    error: NotFound | ParseError<typeof users.signinSchema>;
  };
  'POST /operations/releases/start': {
    input: z.infer<typeof operations.startReleaseSchema>;
    output: StartReleaseOutput;
    error: ServerError | ParseError<typeof operations.startReleaseSchema>;
  };
  'POST /operations/releases/{releaseName}/restart': {
    input: z.infer<typeof operations.restartReleaseSchema>;
    output: RestartReleaseOutput;
    error: ServerError | ParseError<typeof operations.restartReleaseSchema>;
  };
  'POST /operations/channels/{channelName}/restart': {
    input: z.infer<typeof operations.restartChannelSchema>;
    output: RestartChannelOutput;
    error: ServerError | ParseError<typeof operations.restartChannelSchema>;
  };
  'DELETE /operations/releases/{releaseName}': {
    input: z.infer<typeof operations.deleteReleaseSchema>;
    output: DeleteReleaseOutput;
    error: NotFound | ParseError<typeof operations.deleteReleaseSchema>;
  };
  'POST /operations/releases/{releaseName}/restore': {
    input: z.infer<typeof operations.restoreReleaseSchema>;
    output: RestoreReleaseOutput;
    error: NotFound | ParseError<typeof operations.restoreReleaseSchema>;
  };
  'POST /tokens': {
    input: z.infer<typeof tokens.createTokenSchema>;
    output: CreateTokenOutput;
    error: NotFound | ParseError<typeof tokens.createTokenSchema>;
  };
  'DELETE /tokens': {
    input: z.infer<typeof tokens.revokeTokenSchema>;
    output: RevokeTokenOutput;
    error: NotFound | ParseError<typeof tokens.revokeTokenSchema>;
  };
  'GET /tokens': {
    input: z.infer<typeof tokens.listTokensSchema>;
    output: ListTokensOutput;
    error: NotFound | ParseError<typeof tokens.listTokensSchema>;
  };
  'GET /tokens/{token}': {
    input: z.infer<typeof tokens.getTokenSchema>;
    output: GetTokenOutput;
    error: NotFound | ParseError<typeof tokens.getTokenSchema>;
  };
  'POST /tokens/exchange': {
    input: z.infer<typeof tokens.exchangeTokenSchema>;
    output: ExchangeTokenOutput;
    error: Unauthorized | ParseError<typeof tokens.exchangeTokenSchema>;
  };
  'DELETE /tokens/organization/{organizationId}': {
    input: z.infer<typeof tokens.invalidateOrganizationTokensSchema>;
    output: InvalidateOrganizationTokensOutput;
    error:
      | ServerError
      | ParseError<typeof tokens.invalidateOrganizationTokensSchema>;
  };
  'POST /releases': {
    input: z.infer<typeof releases.createReleaseSchema>;
    output: CreateReleaseOutput;
    error: ServerError | ParseError<typeof releases.createReleaseSchema>;
  };
  'GET /releases': {
    input: z.infer<typeof releases.listReleasesSchema>;
    output: ListReleasesOutput;
    error: ServerError | ParseError<typeof releases.listReleasesSchema>;
  };
  'PATCH /releases/complete/{releaseId}': {
    input: z.infer<typeof releases.completeReleaseSchema>;
    output: CompleteReleaseOutput;
    error: BadRequest | ParseError<typeof releases.completeReleaseSchema>;
  };
  'PATCH /releases/{releaseId}': {
    input: z.infer<typeof releases.patchReleaseSchema>;
    output: PatchReleaseOutput;
    error: ServerError | ParseError<typeof releases.patchReleaseSchema>;
  };
  'POST /releases/{releaseId}/snapshots': {
    input: z.infer<typeof releases.createReleaseSnapshotSchema>;
    output: CreateReleaseSnapshotOutput;
    error:
      | ServerError
      | ParseError<typeof releases.createReleaseSnapshotSchema>;
  };
  'POST /secrets': {
    input: z.infer<typeof secrets.createSecretSchema>;
    output: CreateSecretOutput;
    error: ServerError | ParseError<typeof secrets.createSecretSchema>;
  };
  'GET /secrets': {
    input: z.infer<typeof secrets.getSecretsSchema>;
    output: GetSecretsOutput;
    error: ServerError | ParseError<typeof secrets.getSecretsSchema>;
  };
  'DELETE /secrets/{id}': {
    input: z.infer<typeof secrets.deleteSecretSchema>;
    output: DeleteSecretOutput;
    error: ServerError | ParseError<typeof secrets.deleteSecretSchema>;
  };
  'GET /secrets/values': {
    input: z.infer<typeof secrets.getSecretsValuesSchema>;
    output: GetSecretsValuesOutput;
    error: ServerError | ParseError<typeof secrets.getSecretsValuesSchema>;
  };
}
