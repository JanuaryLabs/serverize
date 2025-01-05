import { PaginationMetadata } from './PaginationMetadata';
import { Projects } from './Projects';

export interface ListProjects {
  records: Projects[];
  meta: PaginationMetadata;
}
