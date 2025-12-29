import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type RestartReleaseOutput200 = {
  traceId: any;
  releaseId: string;
  finalUrl: string;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type RestartReleaseOutput401 = UnauthorizedErr;
