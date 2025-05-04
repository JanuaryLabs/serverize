import z from 'zod';
import type * as http from '../http';
import { type Claims } from '../models/Claims.ts';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type CreateDefaultOrganizationOutput200 = Claims;

/**
 * Unauthorized
 */
export type CreateDefaultOrganizationOutput401 = UnauthorizedErr;
