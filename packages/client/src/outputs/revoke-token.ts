import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type RevokeTokenOutput200 = void;

/**
 * Unauthorized
 */
export type RevokeTokenOutput401 = UnauthorizedErr;

/**
 * Response for 404
 */
export type RevokeTokenOutput404 = void;
