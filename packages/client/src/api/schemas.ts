import { KIND } from '../http/index.ts';
import container from './container.ts';
import operations from './operations.ts';
import organizations from './organizations.ts';
import projects from './projects.ts';
import releases from './releases.ts';
import secrets from './secrets.ts';
import tokens from './tokens.ts';
import users from './users.ts';
import workspaces from './workspaces.ts';

export default {
  ...container,
  ...organizations,
  ...workspaces,
  ...projects,
  ...users,
  ...operations,
  ...tokens,
  ...releases,
  ...secrets,
};
