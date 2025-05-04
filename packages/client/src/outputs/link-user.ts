import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type LinkUserOutput200 = {
  accessToken: string;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type LinkUserOutput401 = UnauthorizedErr;

/**
 * Response for 409
 */
export type LinkUserOutput409 = void;
