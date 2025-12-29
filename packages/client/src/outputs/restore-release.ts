import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type RestoreReleaseOutput200 = void;

/**
 * Unauthorized
 */
export type RestoreReleaseOutput401 = UnauthorizedErr;

/**
 * Response for 404
 */
export type RestoreReleaseOutput404 = void;
