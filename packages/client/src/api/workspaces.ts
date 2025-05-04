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
import * as workspaces from '../inputs/workspaces.ts';
import {
  type CreateWorkspaceOutput200,
  type CreateWorkspaceOutput401,
} from '../outputs/create-workspace.ts';
export default {
  'POST /workspaces': {
    schema: workspaces.createWorkspaceSchema,
    output: [
      http.Ok<CreateWorkspaceOutput200>,
      http.Unauthorized<CreateWorkspaceOutput401>,
    ],
    toRequest(input: z.infer<typeof workspaces.createWorkspaceSchema>) {
      const endpoint = 'POST /workspaces';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name', 'organizationId'],
          inputParams: [],
        }),
      );
    },
  },
};
