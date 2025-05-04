import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type StartReleaseOutput200 = {
  traceId: string;
  releaseId: string;
  finalUrl: string;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type StartReleaseOutput401 = UnauthorizedErr;
