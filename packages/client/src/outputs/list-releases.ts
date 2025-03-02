import type { PaginationMetadata } from './pagination-metadata.ts';
import type { Releases } from './releases.ts';
export interface ListReleases {
  records: Releases[];
  meta: PaginationMetadata;
}
