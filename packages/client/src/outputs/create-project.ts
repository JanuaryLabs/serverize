import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type CreateProjectOutput200 = void;

/**
 * Unauthorized
 */
export type CreateProjectOutput401 = UnauthorizedErr;
