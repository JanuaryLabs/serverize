import z from 'zod';

import type * as http from '../http';
import { type Secrets } from '../models/Secrets.ts';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type GetSecretsOutput200 = Secrets[];

/**
 * Unauthorized
 */
export type GetSecretsOutput401 = UnauthorizedErr;
