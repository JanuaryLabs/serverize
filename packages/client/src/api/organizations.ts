import z from 'zod';

import { buffered, chunked } from '../http/parse-response.ts';
import { ParseError } from '../http/parser.ts';
import {
  createUrl,
  formdata,
  json,
  nobody,
  toRequest,
  urlencoded,
} from '../http/request.ts';
import { Unauthorized } from '../http/response.ts';
import * as http from '../http/response.ts';
import * as organizations from '../inputs/organizations.ts';
import {
  type CreateDefaultOrganizationOutput200,
  type CreateDefaultOrganizationOutput401,
} from '../outputs/create-default-organization.ts';
import {
  type CreateOrganizationOutput200,
  type CreateOrganizationOutput401,
} from '../outputs/create-organization.ts';
import {
  type DeleteOrgOutput200,
  type DeleteOrgOutput401,
} from '../outputs/delete-org.ts';
import {
  type ListOrganizationsOutput200,
  type ListOrganizationsOutput401,
} from '../outputs/list-organizations.ts';

export default {
  'DELETE /organizations/{id}': {
    schema: organizations.deleteOrgSchema,
    output: [
      http.Ok<DeleteOrgOutput200>,
      http.Unauthorized<DeleteOrgOutput401>,
    ],
    toRequest(input: z.infer<typeof organizations.deleteOrgSchema>) {
      const endpoint = 'DELETE /organizations/{id}';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['id'],
        }),
      );
    },
  },
  'GET /organizations': {
    schema: organizations.listOrganizationsSchema,
    output: [
      http.Ok<ListOrganizationsOutput200>,
      http.Unauthorized<ListOrganizationsOutput401>,
    ],
    toRequest(input: z.infer<typeof organizations.listOrganizationsSchema>) {
      const endpoint = 'GET /organizations';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['pageSize', 'pageNo'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'POST /organizations': {
    schema: organizations.createOrganizationSchema,
    output: [
      http.Ok<CreateOrganizationOutput200>,
      http.Unauthorized<CreateOrganizationOutput401>,
    ],
    toRequest(input: z.infer<typeof organizations.createOrganizationSchema>) {
      const endpoint = 'POST /organizations';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: [],
        }),
      );
    },
  },
  'POST /organizations/default': {
    schema: organizations.createDefaultOrganizationSchema,
    output: [
      http.Ok<CreateDefaultOrganizationOutput200>,
      http.Unauthorized<CreateDefaultOrganizationOutput401>,
    ],
    toRequest(
      input: z.infer<typeof organizations.createDefaultOrganizationSchema>,
    ) {
      const endpoint = 'POST /organizations/default';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name', 'projectName', 'uid'],
          inputParams: [],
        }),
      );
    },
  },
};
