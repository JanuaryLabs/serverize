import apiKeysEntity from '../entities/api-keys.entity';
import membersEntity from '../entities/members.entity';
import organizationsMembersEntity from '../entities/organizations-members.entity';
import organizationsEntity from '../entities/organizations.entity';
import preferencesEntity from '../entities/preferences.entity';
import projectsEntity from '../entities/projects.entity';
import releasesEntity from '../entities/releases.entity';
import secretsKeysEntity from '../entities/secrets-keys.entity';
import secretsEntity from '../entities/secrets.entity';
import snapshotsEntity from '../entities/snapshots.entity';
import usersEntity from '../entities/users.entity';
import volumesEntity from '../entities/volumes.entity';
import workspacesMembersEntity from '../entities/workspaces-members.entity';
import workspacesEntity from '../entities/workspaces.entity';
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
