export interface AddStockRequest {
  itemId: number;
  quantity: number;
  description: string;
  amountPaid?: number;
  vendorId?: number;
  addToLedger?: boolean;
}
