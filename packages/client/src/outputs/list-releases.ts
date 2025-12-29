import z from 'zod';

import type * as http from '../http';
import { type PaginationMetadata } from '../models/PaginationMetadata.ts';
import { type Releases } from '../models/Releases.ts';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type ListReleasesOutput200 = {
  records: Releases[];
  meta: PaginationMetadata;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type ListReleasesOutput401 = UnauthorizedErr;
