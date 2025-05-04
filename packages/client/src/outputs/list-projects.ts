import z from 'zod';
import type * as http from '../http';
import { type PaginationMetadata } from '../models/PaginationMetadata.ts';
import { type Projects } from '../models/Projects.ts';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type ListProjectsOutput200 = {
  records: Projects[];
  meta: PaginationMetadata;
  [http.KIND]: typeof http.Ok.kind;
};

/**
 * Unauthorized
 */
export type ListProjectsOutput401 = UnauthorizedErr;
