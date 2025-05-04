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
import * as projects from '../inputs/projects.ts';
import {
  type CreateProjectOutput200,
  type CreateProjectOutput401,
} from '../outputs/create-project.ts';
import {
  type ListProjectsOutput200,
  type ListProjectsOutput401,
} from '../outputs/list-projects.ts';
import {
  type PatchProjectOutput200,
  type PatchProjectOutput401,
} from '../outputs/patch-project.ts';
export default {
  'POST /projects': {
    schema: projects.createProjectSchema,
    output: [
      http.Ok<CreateProjectOutput200>,
      http.Unauthorized<CreateProjectOutput401>,
    ],
    toRequest(input: z.infer<typeof projects.createProjectSchema>) {
      const endpoint = 'POST /projects';
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
  'GET /projects': {
    schema: projects.listProjectsSchema,
    output: [
      http.Ok<ListProjectsOutput200>,
      http.Unauthorized<ListProjectsOutput401>,
    ],
    toRequest(input: z.infer<typeof projects.listProjectsSchema>) {
      const endpoint = 'GET /projects';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['workspaceId', 'name', 'pageSize', 'pageNo'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'PATCH /projects/{id}': {
    schema: projects.patchProjectSchema,
    output: [
      http.Ok<PatchProjectOutput200>,
      http.Unauthorized<PatchProjectOutput401>,
    ],
    toRequest(input: z.infer<typeof projects.patchProjectSchema>) {
      const endpoint = 'PATCH /projects/{id}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: ['id'],
        }),
      );
    },
  },
};
