import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type InvalidateOrganizationTokensOutput200 = {
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type InvalidateOrganizationTokensOutput401 = UnauthorizedErr;
