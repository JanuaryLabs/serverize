import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type RestartChannelOutput200 = {
  traces: string[];
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type RestartChannelOutput401 = UnauthorizedErr;
