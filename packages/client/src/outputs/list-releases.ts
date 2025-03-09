import z from 'zod';
import { type PaginationMetadata } from '../models/PaginationMetadata.ts';
import { type Releases } from '../models/Releases.ts';
export type ListReleasesOutput = {
  records: Releases[];
  meta: PaginationMetadata;
};
