import { Customer } from './customer.model';

export interface CustomerPagination {
  elements: Customer[];
  currentPageNumber: number;
  numberOfTotalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}
