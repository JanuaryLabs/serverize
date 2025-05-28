import { table } from 'console';
import { field, index, mandatory, unique } from '@januarylabs/declarative';

import { tables } from '#entities';
export default {
  volumes: table({
    fields: {
      release: field.relation({
        references: tables.releases,
        relationship: 'many-to-one',
        validations: [mandatory()],
      }),
      src: field.shortText({
        validations: [mandatory(), unique()],
      }),
      dest: field.shortText({
        validations: [mandatory()],
      }),
    },
  }),
  releases: table({
    fields: {
      serviceName: field.shortText(),
      containerName: field.shortText(),
      tarLocation: field.shortText(),
      domainPrefix: field.shortText({
        validations: [mandatory()],
      }),
      port: field.integer(),
      protocol: field.enum({
        values: ['https', 'tcp'],
      }),
      image: field.shortText(),
      runtimeConfig: field({ type: 'json' }),
      name: field.shortText({
        validations: [mandatory()],
      }),
      project: field.relation({
        references: tables.projects,
        relationship: 'many-to-one',
        validations: [mandatory()],
      }),
      channel: field.enum({
        values: ['dev', 'preview'],
        defaultValue: 'dev',
        validations: [mandatory()],
      }),
      conclusion: field.enum({
        values: [
          'processing',
          'published',
          'success',
          'failure',
          'cancelled',
          'timed_out',
        ],
      }),
      status: field.enum({
        values: [
          'requested', // in the cli
          'in_progress', // once got to serverize
          'completed', // once all the steps are done regardless of the conclusion
          'queued',
          'waiting', // waiting for the container to be ready
        ],
      }),
    },
  }),
  snapshots: table({
    fields: {
      release: field.relation({
        references: tables.releases,
        relationship: 'one-to-one',
        validations: [mandatory()],
      }),
      name: field({
        type: 'short-text',
        validations: [mandatory()],
      }),
    },
  }),
  secrets: table({
    constraints: [index('project', 'label')],
    fields: {
      project: field.relation({
        references: tables.projects,
        relationship: 'many-to-one',
        validations: [mandatory()],
      }),
      label: field({
        type: 'short-text',
        validations: [mandatory()],
      }),
      channel: field.enum({
        values: ['dev', 'preview'],
        defaultValue: 'dev',
        validations: [mandatory()],
      }),
      nonce: field.bytes({ validations: [mandatory()] }),
      secret: field.bytes({ validations: [mandatory()] }),
    },
  }),
  secretsKeys: table({
    fields: {
      project: field.relation({
        references: tables.projects,
        relationship: 'many-to-one',
        validations: [mandatory(), unique()],
      }),
      key: field.bytes({ validations: [mandatory()] }),
    },
  }),
  apiKeys: table({
    fields: {
      project: field.relation({
        references: tables.projects,
        relationship: 'many-to-one',
        validations: [mandatory()],
      }),
      key: field.shortText({ validations: [mandatory()] }),
    },
  }),
  organizations: table({
    fields: {
      name: field({
        type: 'short-text',
        validations: [mandatory(), unique()],
      }),
    },
  }),
  workspaces: table({
    fields: {
      name: field({ type: 'short-text', validations: [mandatory()] }),
      organization: field.relation({
        references: tables.organizations,
        relationship: 'many-to-one',
      }),
    },
  }),
  projects: table({
    constraints: [index('name', 'workspace')],
    fields: {
      name: field({ type: 'short-text', validations: [mandatory()] }),
      workspace: field.relation({
        references: tables.workspaces,
        relationship: 'many-to-one',
        validations: [mandatory()],
      }),
    },
  }),
  members: table({
    fields: {
      user: field.relation({
        references: tables.users,
        relationship: 'many-to-one',
      }),
      organization: field.relation({
        references: tables.organizations,
        relationship: 'many-to-one',
      }),
    },
  }),
  organizationsMembers: table({
    fields: {
      organization: field.relation({
        references: tables.organizations,
        relationship: 'many-to-one',
      }),
      member: field.relation({
        references: tables.members,
        relationship: 'many-to-one',
      }),
    },
  }),
  // workspace may have memebers from own organization
  workspacesMembers: table({
    fields: {
      workspace: field.relation({
        references: tables.workspaces,
        relationship: 'many-to-one',
      }),
      member: field.relation({
        references: tables.members,
        relationship: 'many-to-one',
      }),
    },
  }),
  users: table({
    fields: {
      id: field.primary({ type: 'string', generated: false }),
      // TODO: assign organizationId, workspaceId, projectId
    },
  }),
  preferences: table({
    fields: {
      user: field.relation({
        references: tables.users,
        relationship: 'one-to-one',
      }),
      organization: field.relation({
        references: tables.organizations,
        relationship: 'many-to-one',
      }),
      workspace: field.relation({
        references: tables.workspaces,
        relationship: 'many-to-one',
      }),
    },
  }),
};
