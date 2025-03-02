import type { Organizations } from './organizations.ts';
import type { PaginationMetadata } from './pagination-metadata.ts';
export interface ListOrganizations {
  records: Organizations[];
  meta: PaginationMetadata;
}
