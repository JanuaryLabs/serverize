import { PaginationMetadata } from './PaginationMetadata';
import { Releases } from './Releases';
export interface ListReleases {
  records: Releases[];
  meta: PaginationMetadata;
}
