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
import { BadRequest, Unauthorized } from '../http/response.ts';
import * as http from '../http/response.ts';
import * as releases from '../inputs/releases.ts';
import {
  type CompleteReleaseOutput200,
  type CompleteReleaseOutput400,
  type CompleteReleaseOutput401,
} from '../outputs/complete-release.ts';
import {
  type CreateReleaseSnapshotOutput200,
  type CreateReleaseSnapshotOutput401,
} from '../outputs/create-release-snapshot.ts';
import {
  type CreateReleaseOutput200,
  type CreateReleaseOutput401,
} from '../outputs/create-release.ts';
import {
  type ListReleasesOutput200,
  type ListReleasesOutput401,
} from '../outputs/list-releases.ts';
import {
  type PatchReleaseOutput200,
  type PatchReleaseOutput401,
} from '../outputs/patch-release.ts';
export default {
  'POST /releases': {
    schema: releases.createReleaseSchema,
    output: [
      http.Ok<CreateReleaseOutput200>,
      http.Unauthorized<CreateReleaseOutput401>,
    ],
    toRequest(input: z.infer<typeof releases.createReleaseSchema>) {
      const endpoint = 'POST /releases';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['releaseName', 'projectId', 'channel'],
          inputParams: [],
        }),
      );
    },
  },
  'GET /releases': {
    schema: releases.listReleasesSchema,
    output: [
      http.Ok<ListReleasesOutput200>,
      http.Unauthorized<ListReleasesOutput401>,
    ],
    toRequest(input: z.infer<typeof releases.listReleasesSchema>) {
      const endpoint = 'GET /releases';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [
            'projectId',
            'channel',
            'status',
            'conclusion',
            'pageSize',
            'pageNo',
          ],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
  'PATCH /releases/complete/{releaseId}': {
    schema: releases.completeReleaseSchema,
    output: [
      http.Ok<CompleteReleaseOutput200>,
      http.BadRequest<CompleteReleaseOutput400>,
      http.Unauthorized<CompleteReleaseOutput401>,
    ],
    toRequest(input: z.infer<typeof releases.completeReleaseSchema>) {
      const endpoint = 'PATCH /releases/complete/{releaseId}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['conclusion', 'containerName', 'tarLocation'],
          inputParams: ['releaseId'],
        }),
      );
    },
  },
  'PATCH /releases/{releaseId}': {
    schema: releases.patchReleaseSchema,
    output: [
      http.Ok<PatchReleaseOutput200>,
      http.Unauthorized<PatchReleaseOutput401>,
    ],
    toRequest(input: z.infer<typeof releases.patchReleaseSchema>) {
      const endpoint = 'PATCH /releases/{releaseId}';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['status', 'conclusion', 'containerName'],
          inputParams: ['releaseId'],
        }),
      );
    },
  },
  'POST /releases/{releaseId}/snapshots': {
    schema: releases.createReleaseSnapshotSchema,
    output: [
      http.Ok<CreateReleaseSnapshotOutput200>,
      http.Unauthorized<CreateReleaseSnapshotOutput401>,
    ],
    toRequest(input: z.infer<typeof releases.createReleaseSnapshotSchema>) {
      const endpoint = 'POST /releases/{releaseId}/snapshots';
      return toRequest(
        endpoint,
        json(input, {
          inputHeaders: [],
          inputQuery: [],
          inputBody: ['name'],
          inputParams: ['releaseId'],
        }),
      );
    },
  },
};
