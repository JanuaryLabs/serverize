import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type CompleteReleaseOutput200 = { [http.KIND]: typeof http.Ok.kind };

/**
 * Response for 400
 */
export type CompleteReleaseOutput400 = void;

/**
 * Unauthorized
 */
export type CompleteReleaseOutput401 = UnauthorizedErr;
