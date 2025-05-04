import z from 'zod';
import type * as http from '../http';
import { type ApiKeys } from '../models/ApiKeys.ts';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type ListTokensOutput200 = ApiKeys[];

/**
 * Unauthorized
 */
export type ListTokensOutput401 = UnauthorizedErr;

/**
 * Response for 404
 */
export type ListTokensOutput404 = void;
