import z from 'zod';
import { type PaginationMetadata } from '../models/PaginationMetadata.ts';
import { type Projects } from '../models/Projects.ts';
export type ListProjectsOutput = {
  records: Projects[];
  meta: PaginationMetadata;
};
