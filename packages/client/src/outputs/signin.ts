import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type SigninOutput200 = {
  accessToken: string;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type SigninOutput401 = UnauthorizedErr;

/**
 * Response for 404
 */
export type SigninOutput404 = void;
