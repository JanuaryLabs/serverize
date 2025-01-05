import { Organizations } from './Organizations';
import { PaginationMetadata } from './PaginationMetadata';
export interface ListOrganizations {
  records: Organizations[];
  meta: PaginationMetadata;
}
