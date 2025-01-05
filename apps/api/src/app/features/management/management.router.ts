import { apiReference } from '@scalar/hono-api-reference';
import { consume, createOutput } from '@workspace/extensions/hono';
import { policies } from '@workspace/extensions/identity';
import { authorize } from '@workspace/identity';
import { type HonoEnv } from '@workspace/utils';
import { parseOrThrow } from '@workspace/validation';
import { Hono } from 'hono';
import z from 'zod';

import swagger from './management.swagger.json';
import * as organizations from './organizations';
import * as projects from './projects';
import * as users from './users';
import * as workspaces from './workspaces';

const router = new Hono<HonoEnv>();
router.get(
  '/management/swagger',
  apiReference({
    spec: { url: swagger as any },
  }),
);
router.delete(
  '/organizations/:id',
  authorize(policies.adminOnly),
  async (context, next) => {
    const path = context.req.param();
    const input = parseOrThrow(organizations.deleteOrgSchema, { id: path.id });
    const output = createOutput(context);
    await organizations.deleteOrg(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.get(
  '/organizations',
  authorize(policies.authenticated, policies.adminOnly),
  async (context, next) => {
    const query = context.req.query();
    const input = parseOrThrow(organizations.listOrganizationsSchema, {
      pageSize: query.pageSize,
      pageNo: query.pageNo,
    });
    const output = createOutput(context);
    await organizations.listOrganizations(
      input,
      output,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
router.post(
  '/organizations/default',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(organizations.createDefaultOrganizationSchema, {
      name: body.name,
      projectName: body.projectName,
      uid: body.uid,
    });
    const output = createOutput(context);
    await organizations.createDefaultOrganization(
      input,
      output,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
router.post(
  '/organizations',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(organizations.createOrganizationSchema, {
      name: body.name,
    });
    const output = createOutput(context);
    await organizations.createOrganization(
      input,
      output,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
router.post(
  '/workspaces',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(workspaces.createWorkspaceSchema, {
      name: body.name,
      organizationId: body.organizationId,
    });
    const output = createOutput(context);
    await workspaces.createWorkspace(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.post(
  '/projects',
  consume('application/json'),
  authorize(policies.authenticated),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(projects.createProjectSchema, {
      name: body.name,
    });
    const output = createOutput(context);
    await projects.createProject(
      input,
      output,
      context.var.subject!,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
router.patch(
  '/projects/:id',
  consume('application/json'),
  authorize(policies.notImplemented),
  async (context, next) => {
    const path = context.req.param();
    const body = await context.req.json();
    const input = parseOrThrow(projects.patchProjectSchema, {
      id: path.id,
      name: body.name,
    });
    const output = createOutput(context);
    await projects.patchProject(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.get(
  '/projects',
  authorize(policies.authenticated),
  async (context, next) => {
    const query = context.req.query();
    const input = parseOrThrow(projects.listProjectsSchema, {
      workspaceId: query.workspaceId,
      name: query.name,
      pageSize: query.pageSize,
      pageNo: query.pageNo,
    });
    const output = createOutput(context);
    await projects.listProjects(
      input,
      output,
      context.var.subject!,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
router.get(
  '/users/organizations',
  authorize(policies.authenticated),
  async (context, next) => {
    const output = createOutput(context);
    await users.listUserOrganizations(
      output,
      context.var.subject!,
      context.req.raw.signal,
    );
    return output.finalize();
  },
);
router.post(
  '/users/link',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(users.linkUserSchema, {
      token: body.token,
      providerId: body.providerId,
      orgName: body.orgName,
      projectName: body.projectName,
    });
    const output = createOutput(context);
    await users.linkUser(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
router.post(
  '/users/signin',
  consume('application/json'),
  authorize(),
  async (context, next) => {
    const body = await context.req.json();
    const input = parseOrThrow(users.signinSchema, {
      token: body.token,
      providerId: body.providerId,
    });
    const output = createOutput(context);
    await users.signin(input, output, context.req.raw.signal);
    return output.finalize();
  },
);
export default ['/', router] as const;
