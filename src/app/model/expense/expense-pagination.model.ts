import { Expense } from './expense.model';

export interface ExpensePagination {
  elements: Expense[];
  currentPageNumber: number;
  numberOfTotalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}
