import { LedgerEntry } from './ledger-entry.model';

export interface LedgerPagination {
  elements: LedgerEntry[];
  currentPageNumber: number;
  numberOfTotalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}
