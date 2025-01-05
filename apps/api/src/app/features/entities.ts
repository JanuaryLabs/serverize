import membersEntity from './management/members.entity';
import organizationsMembersEntity from './management/organizations-members.entity';
import organizationsEntity from './management/organizations.entity';
import preferencesEntity from './management/preferences.entity';
import projectsEntity from './management/projects.entity';
import usersEntity from './management/users.entity';
import workspacesMembersEntity from './management/workspaces-members.entity';
import workspacesEntity from './management/workspaces.entity';
import apiKeysEntity from './projects/api-keys.entity';
import releasesEntity from './projects/releases.entity';
import secretsKeysEntity from './projects/secrets-keys.entity';
import secretsEntity from './projects/secrets.entity';
import snapshotsEntity from './projects/snapshots.entity';
import volumesEntity from './projects/volumes.entity';
const entities = [
  membersEntity,
  organizationsMembersEntity,
  organizationsEntity,
  preferencesEntity,
  projectsEntity,
  usersEntity,
  workspacesMembersEntity,
  workspacesEntity,
  apiKeysEntity,
  releasesEntity,
  secretsKeysEntity,
  secretsEntity,
  snapshotsEntity,
  volumesEntity,
];

export const tables = {
  members: membersEntity,
  organizationsMembers: organizationsMembersEntity,
  organizations: organizationsEntity,
  preferences: preferencesEntity,
  projects: projectsEntity,
  users: usersEntity,
  workspacesMembers: workspacesMembersEntity,
  workspaces: workspacesEntity,
  apiKeys: apiKeysEntity,
  releases: releasesEntity,
  secretsKeys: secretsKeysEntity,
  secrets: secretsEntity,
  snapshots: snapshotsEntity,
  volumes: volumesEntity,
} as const;
export default entities;