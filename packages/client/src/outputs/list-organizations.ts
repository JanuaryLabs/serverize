import z from 'zod';
import { type Organizations } from '../models/Organizations.ts';
import { type PaginationMetadata } from '../models/PaginationMetadata.ts';
export type ListOrganizationsOutput = {
  records: Organizations[];
  meta: PaginationMetadata;
};
