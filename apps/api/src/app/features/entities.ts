import apiKeysEntity from '../entities/api-keys.entity.ts';
import membersEntity from '../entities/members.entity.ts';
import organizationsMembersEntity from '../entities/organizations-members.entity.ts';
import organizationsEntity from '../entities/organizations.entity.ts';
import preferencesEntity from '../entities/preferences.entity.ts';
import projectsEntity from '../entities/projects.entity.ts';
import releasesEntity from '../entities/releases.entity.ts';
import secretsKeysEntity from '../entities/secrets-keys.entity.ts';
import secretsEntity from '../entities/secrets.entity.ts';
import snapshotsEntity from '../entities/snapshots.entity.ts';
import usersEntity from '../entities/users.entity.ts';
import volumesEntity from '../entities/volumes.entity.ts';
import workspacesMembersEntity from '../entities/workspaces-members.entity.ts';
import workspacesEntity from '../entities/workspaces.entity.ts';
const entities = [
  apiKeysEntity,
  membersEntity,
  organizationsMembersEntity,
  organizationsEntity,
  preferencesEntity,
  projectsEntity,
  releasesEntity,
  secretsKeysEntity,
  secretsEntity,
  snapshotsEntity,
  usersEntity,
  volumesEntity,
  workspacesMembersEntity,
  workspacesEntity,
];

export const tables = {
  apiKeys: apiKeysEntity,
  members: membersEntity,
  organizationsMembers: organizationsMembersEntity,
  organizations: organizationsEntity,
  preferences: preferencesEntity,
  projects: projectsEntity,
  releases: releasesEntity,
  secretsKeys: secretsKeysEntity,
  secrets: secretsEntity,
  snapshots: snapshotsEntity,
  users: usersEntity,
  volumes: volumesEntity,
  workspacesMembers: workspacesMembersEntity,
  workspaces: workspacesEntity,
} as const;
export default entities;
