import { Releases } from './Releases';
import { PaginationMetadata } from './PaginationMetadata';
export interface ListReleases {
records: Releases[]
meta: PaginationMetadata
}
