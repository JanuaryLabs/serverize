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
import { NotFound, Unauthorized } from '../http/response.ts';
import * as http from '../http/response.ts';
import * as tokens from '../inputs/tokens.ts';
import {
  type CreateTokenOutput200,
  type CreateTokenOutput401,
  type CreateTokenOutput404,
} from '../outputs/create-token.ts';
import {
  type ExchangeTokenOutput200,
  type ExchangeTokenOutput401,
} from '../outputs/exchange-token.ts';
import {
  type GetTokenOutput200,
  type GetTokenOutput401,
  type GetTokenOutput404,
} from '../outputs/get-token.ts';
import {
  type InvalidateOrganizationTokensOutput200,
  type InvalidateOrganizationTokensOutput401,
} from '../outputs/invalidate-organization-tokens.ts';
import {
  type ListTokensOutput200,
  type ListTokensOutput401,
  type ListTokensOutput404,
} from '../outputs/list-tokens.ts';
import {
  type RevokeTokenOutput200,
  type RevokeTokenOutput401,
  type RevokeTokenOutput404,
} from '../outputs/revoke-token.ts';

export default {
  'POST /tokens': {
    schema: tokens.createTokenSchema,
    output: [
      http.Ok<CreateTokenOutput200>,
      http.Unauthorized<CreateTokenOutput401>,
      http.NotFound<CreateTokenOutput404>,
    ],
    toRequest(input: z.infer<typeof tokens.createTokenSchema>) {
      const endpoint = 'POST /tokens';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectName'],
          inputParams: [],
        }),
      );
    },
  },
  'DELETE /tokens': {
    schema: tokens.revokeTokenSchema,
    output: [
      http.Ok<RevokeTokenOutput200>,
      http.Unauthorized<RevokeTokenOutput401>,
      http.NotFound<RevokeTokenOutput404>,
    ],
    toRequest(input: z.infer<typeof tokens.revokeTokenSchema>) {
      const endpoint = 'DELETE /tokens';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectName', 'token'],
          inputParams: [],
        }),
      );
    },
  },
  'GET /tokens': {
    schema: tokens.listTokensSchema,
    output: [
      http.Ok<ListTokensOutput200>,
      http.Unauthorized<ListTokensOutput401>,
      http.NotFound<ListTokensOutput404>,
    ],
    toRequest(input: z.infer<typeof tokens.listTokensSchema>) {
      const endpoint = 'GET /tokens';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['projectName'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'GET /tokens/{token}': {
    schema: tokens.getTokenSchema,
    output: [
      http.Ok<GetTokenOutput200>,
      http.Unauthorized<GetTokenOutput401>,
      http.NotFound<GetTokenOutput404>,
    ],
    toRequest(input: z.infer<typeof tokens.getTokenSchema>) {
      const endpoint = 'GET /tokens/{token}';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['token'],
        }),
      );
    },
  },
  'POST /tokens/exchange': {
    schema: tokens.exchangeTokenSchema,
    output: [
      http.Ok<ExchangeTokenOutput200>,
      http.Unauthorized<ExchangeTokenOutput401>,
    ],
    toRequest(input: z.infer<typeof tokens.exchangeTokenSchema>) {
      const endpoint = 'POST /tokens/exchange';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['token'],
          inputParams: [],
        }),
      );
    },
  },
  'DELETE /tokens/organization/{organizationId}': {
    schema: tokens.invalidateOrganizationTokensSchema,
    output: [
      http.Ok<InvalidateOrganizationTokensOutput200>,
      http.Unauthorized<InvalidateOrganizationTokensOutput401>,
    ],
    toRequest(
      input: z.infer<typeof tokens.invalidateOrganizationTokensSchema>,
    ) {
      const endpoint = 'DELETE /tokens/organization/{organizationId}';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [],
          inputParams: ['organizationId'],
        }),
      );
    },
  },
};
