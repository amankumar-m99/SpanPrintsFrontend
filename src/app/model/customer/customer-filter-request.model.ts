export interface CustomerFilterRequest {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  outstandingAmountMin?: number | null;
  outstandingAmountMax?: number | null;
}
