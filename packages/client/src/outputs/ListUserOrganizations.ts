import { Organizations } from './Organizations';
import { PaginationMetadata } from './PaginationMetadata';
export interface ListUserOrganizations {
  records: Organizations[];
  meta: PaginationMetadata;
}
