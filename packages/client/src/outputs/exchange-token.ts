import z from 'zod';

import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type ExchangeTokenOutput200 = {
  accessToken: string;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type ExchangeTokenOutput401 = UnauthorizedErr;
