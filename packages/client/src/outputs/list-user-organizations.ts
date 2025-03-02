import type { Organizations } from './organizations.ts';
import type { PaginationMetadata } from './pagination-metadata.ts';
export interface ListUserOrganizations {
  records: Organizations[];
  meta: PaginationMetadata;
}
