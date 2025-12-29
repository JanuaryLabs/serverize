import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type GetSecretsValuesOutput200 = { [key: string]: string };

/**
 * Unauthorized
 */
export type GetSecretsValuesOutput401 = UnauthorizedErr;
