import z from 'zod';
import type * as http from '../http';
import { type Organizations } from '../models/Organizations.ts';
import { type PaginationMetadata } from '../models/PaginationMetadata.ts';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type ListOrganizationsOutput200 = {
  records: Organizations[];
  meta: PaginationMetadata;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type ListOrganizationsOutput401 = UnauthorizedErr;
