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
import * as secrets from '../inputs/secrets.ts';
import {
  type CreateSecretOutput200,
  type CreateSecretOutput401,
} from '../outputs/create-secret.ts';
import {
  type DeleteSecretOutput200,
  type DeleteSecretOutput401,
} from '../outputs/delete-secret.ts';
import {
  type GetSecretsValuesOutput200,
  type GetSecretsValuesOutput401,
} from '../outputs/get-secrets-values.ts';
import {
  type GetSecretsOutput200,
  type GetSecretsOutput401,
} from '../outputs/get-secrets.ts';
export default {
  'POST /secrets': {
    schema: secrets.createSecretSchema,
    output: [
      http.Ok<CreateSecretOutput200>,
      http.Unauthorized<CreateSecretOutput401>,
    ],
    toRequest(input: z.infer<typeof secrets.createSecretSchema>) {
      const endpoint = 'POST /secrets';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'channel', 'secretLabel', 'secretValue'],
          inputParams: [],
        }),
      );
    },
  },
  'GET /secrets': {
    schema: secrets.getSecretsSchema,
    output: [
      http.Ok<GetSecretsOutput200>,
      http.Unauthorized<GetSecretsOutput401>,
    ],
    toRequest(input: z.infer<typeof secrets.getSecretsSchema>) {
      const endpoint = 'GET /secrets';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['projectId', 'channel'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'DELETE /secrets/{id}': {
    schema: secrets.deleteSecretSchema,
    output: [
      http.Ok<DeleteSecretOutput200>,
      http.Unauthorized<DeleteSecretOutput401>,
    ],
    toRequest(input: z.infer<typeof secrets.deleteSecretSchema>) {
      const endpoint = 'DELETE /secrets/{id}';
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
  'GET /secrets/values': {
    schema: secrets.getSecretsValuesSchema,
    output: [
      http.Ok<GetSecretsValuesOutput200>,
      http.Unauthorized<GetSecretsValuesOutput401>,
    ],
    toRequest(input: z.infer<typeof secrets.getSecretsValuesSchema>) {
      const endpoint = 'GET /secrets/values';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['projectId', 'channel'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
};
