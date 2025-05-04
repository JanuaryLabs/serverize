import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type PatchReleaseOutput200 = { [http.KIND]: typeof http.Ok.kind };

/**
 * Unauthorized
 */
export type PatchReleaseOutput401 = UnauthorizedErr;
