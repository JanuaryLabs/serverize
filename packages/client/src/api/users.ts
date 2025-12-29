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
import { Conflict, NotFound, Unauthorized } from '../http/response.ts';
import * as http from '../http/response.ts';
import * as users from '../inputs/users.ts';
import {
  type LinkUserOutput200,
  type LinkUserOutput401,
  type LinkUserOutput409,
} from '../outputs/link-user.ts';
import {
  type SigninOutput200,
  type SigninOutput401,
  type SigninOutput404,
} from '../outputs/signin.ts';

export default {
  'POST /users/link': {
    schema: users.linkUserSchema,
    output: [
      http.Ok<LinkUserOutput200>,
      http.Unauthorized<LinkUserOutput401>,
      http.Conflict<LinkUserOutput409>,
    ],
    toRequest(input: z.infer<typeof users.linkUserSchema>) {
      const endpoint = 'POST /users/link';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token', 'providerId', 'orgName', 'projectName'],
          inputParams: [],
        }),
      );
    },
  },
  'POST /users/signin': {
    schema: users.signinSchema,
    output: [
      http.Ok<SigninOutput200>,
      http.Unauthorized<SigninOutput401>,
      http.NotFound<SigninOutput404>,
    ],
    toRequest(input: z.infer<typeof users.signinSchema>) {
      const endpoint = 'POST /users/signin';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token', 'providerId', 'source'],
          inputParams: [],
        }),
      );
    },
  },
};
