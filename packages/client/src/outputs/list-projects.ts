import type { PaginationMetadata } from './pagination-metadata.ts';
import type { Projects } from './projects.ts';
export interface ListProjects {
  records: Projects[];
  meta: PaginationMetadata;
}
