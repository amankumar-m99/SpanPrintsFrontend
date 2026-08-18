export interface LedgerFilterRequest {
  ledgerTypes?: string[];
  ledgerSources?: string[];
  amountMin?: number | null;
  amountMax?: number | null;
  transactionDateMin?: string | null;
  transactionDateMax?: string | null;
  uuid?: string | null;
  description?: string | null;
}
