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
import * as operations from '../inputs/operations.ts';
import {
  type DeleteReleaseOutput200,
  type DeleteReleaseOutput401,
  type DeleteReleaseOutput404,
} from '../outputs/delete-release.ts';
import {
  type ReadProgressOutput200,
  type ReadProgressOutput401,
} from '../outputs/read-progress.ts';
import {
  type RestartChannelOutput200,
  type RestartChannelOutput401,
} from '../outputs/restart-channel.ts';
import {
  type RestartReleaseOutput200,
  type RestartReleaseOutput401,
} from '../outputs/restart-release.ts';
import {
  type RestoreReleaseOutput200,
  type RestoreReleaseOutput401,
  type RestoreReleaseOutput404,
} from '../outputs/restore-release.ts';
import {
  type StartReleaseOutput200,
  type StartReleaseOutput401,
} from '../outputs/start-release.ts';

export default {
  'GET /operations/read': {
    schema: operations.readProgressSchema,
    output: [
      { type: http.Ok<ReadProgressOutput200>, parser: chunked },
      http.Unauthorized<ReadProgressOutput401>,
    ],
    toRequest(input: z.infer<typeof operations.readProgressSchema>) {
      const endpoint = 'GET /operations/read';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: ['traceId'],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'POST /operations/releases/start': {
    schema: operations.startReleaseSchema,
    output: [
      http.Ok<StartReleaseOutput200>,
      http.Unauthorized<StartReleaseOutput401>,
    ],
    toRequest(input: z.infer<typeof operations.startReleaseSchema>) {
      const endpoint = 'POST /operations/releases/start';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: [
            'releaseName',
            'projectId',
            'projectName',
            'channel',
            'tarLocation',
            'runtimeConfig',
            'port',
            'protocol',
            'image',
            'volumes',
            'serviceName',
            'environment',
          ],
          inputParams: [],
        }),
      );
    },
  },
  'POST /operations/releases/{releaseName}/restart': {
    schema: operations.restartReleaseSchema,
    output: [
      http.Ok<RestartReleaseOutput200>,
      http.Unauthorized<RestartReleaseOutput401>,
    ],
    toRequest(input: z.infer<typeof operations.restartReleaseSchema>) {
      const endpoint = 'POST /operations/releases/{releaseName}/restart';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: ['jwt'],
          inputQuery: [],
          inputBody: ['projectId', 'projectName', 'channel'],
          inputParams: ['releaseName'],
        }),
      );
    },
  },
  'POST /operations/channels/{channelName}/restart': {
    schema: operations.restartChannelSchema,
    output: [
      http.Ok<RestartChannelOutput200>,
      http.Unauthorized<RestartChannelOutput401>,
    ],
    toRequest(input: z.infer<typeof operations.restartChannelSchema>) {
      const endpoint = 'POST /operations/channels/{channelName}/restart';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: ['jwt'],
          inputQuery: [],
          inputBody: ['projectId', 'projectName'],
          inputParams: ['channel'],
        }),
      );
    },
  },
  'DELETE /operations/releases/{releaseName}': {
    schema: operations.deleteReleaseSchema,
    output: [
      http.Ok<DeleteReleaseOutput200>,
      http.Unauthorized<DeleteReleaseOutput401>,
      http.NotFound<DeleteReleaseOutput404>,
    ],
    toRequest(input: z.infer<typeof operations.deleteReleaseSchema>) {
      const endpoint = 'DELETE /operations/releases/{releaseName}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'channel'],
          inputParams: ['releaseName'],
        }),
      );
    },
  },
  'POST /operations/releases/{releaseName}/restore': {
    schema: operations.restoreReleaseSchema,
    output: [
      http.Ok<RestoreReleaseOutput200>,
      http.Unauthorized<RestoreReleaseOutput401>,
      http.NotFound<RestoreReleaseOutput404>,
    ],
    toRequest(input: z.infer<typeof operations.restoreReleaseSchema>) {
      const endpoint = 'POST /operations/releases/{releaseName}/restore';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['projectId', 'channel'],
          inputParams: ['releaseName'],
        }),
      );
    },
  },
};
