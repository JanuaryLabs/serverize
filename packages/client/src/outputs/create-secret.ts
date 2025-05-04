import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type CreateSecretOutput200 = { [http.KIND]: typeof http.Ok.kind };

/**
 * Unauthorized
 */
export type CreateSecretOutput401 = UnauthorizedErr;
