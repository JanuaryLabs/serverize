import { Projects } from './Projects';
import { PaginationMetadata } from './PaginationMetadata';
export interface ListProjects {
records: Projects[]
meta: PaginationMetadata
}
