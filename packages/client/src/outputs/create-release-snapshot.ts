import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type CreateReleaseSnapshotOutput200 = {
  id: string;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type CreateReleaseSnapshotOutput401 = UnauthorizedErr;
