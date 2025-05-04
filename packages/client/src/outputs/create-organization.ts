import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type CreateOrganizationOutput200 = void;

/**
 * Unauthorized
 */
export type CreateOrganizationOutput401 = UnauthorizedErr;
