import z from 'zod';
import type * as http from '../http';
import { type ApiKeys } from '../models/ApiKeys.ts';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type GetTokenOutput200 = ApiKeys;

/**
 * Unauthorized
 */
export type GetTokenOutput401 = UnauthorizedErr;

/**
 * Response for 404
 */
export type GetTokenOutput404 = void;
