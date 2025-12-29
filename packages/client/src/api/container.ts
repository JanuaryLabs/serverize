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
import * as container from '../inputs/container.ts';
import {
  type StreamContainerLogsOutput200,
  type StreamContainerLogsOutput401,
} from '../outputs/stream-container-logs.ts';

export default {
  'GET /container/logs': {
    schema: container.streamContainerLogsSchema,
    output: [
      { type: http.Ok<StreamContainerLogsOutput200>, parser: chunked },
      http.Unauthorized<StreamContainerLogsOutput401>,
    ],
    toRequest(input: z.infer<typeof container.streamContainerLogsSchema>) {
      const endpoint = 'GET /container/logs';
      return toRequest(
        endpoint,
        nobody(input, {
          inputHeaders: [],
          inputQuery: [
            'projectName',
            'channelName',
            'releaseName',
            'timestamp',
            'details',
            'tail',
          ],
          inputBody: [],
          inputParams: [],
        }),
      );
    },
  },
};
