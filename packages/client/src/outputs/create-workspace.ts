import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type CreateWorkspaceOutput200 = void;

/**
 * Unauthorized
 */
export type CreateWorkspaceOutput401 = UnauthorizedErr;
