import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type CreateTokenOutput200 = any;

/**
 * Unauthorized
 */
export type CreateTokenOutput401 = UnauthorizedErr;

/**
 * Response for 404
 */
export type CreateTokenOutput404 = void;
