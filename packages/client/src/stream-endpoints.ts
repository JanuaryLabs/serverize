import z from 'zod';

import * as docker from './inputs/docker';
import * as management from './inputs/management';
import * as operations from './inputs/operations';
import * as projects from './inputs/projects';
import * as root from './inputs/root';
import { StreamContainerLogs } from './outputs/StreamContainerLogs';

export interface StreamEndpoints {
  'GET /container/logs': {
    input: z.infer<typeof docker.streamContainerLogsSchema>;
    output: StreamContainerLogs;
  };
}
