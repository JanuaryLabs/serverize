import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type DeleteReleaseOutput200 = void;

/**
 * Unauthorized
 */
export type DeleteReleaseOutput401 = UnauthorizedErr;

/**
 * Response for 404
 */
export type DeleteReleaseOutput404 = void;
