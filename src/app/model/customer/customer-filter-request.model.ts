export interface CustomerFilterRequest {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  outstandingAmountMin?: number | null;
  outstandingAmountMax?: number | null;
  orderCountMin?: number | null;
  orderCountMax?: number | null;
}
