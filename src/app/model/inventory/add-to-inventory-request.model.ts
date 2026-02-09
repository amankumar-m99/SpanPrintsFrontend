export interface AddToInventoryRequest {
    vendorId: number;
    itemId: number;
    quantity: number;
    rate: number;
    amountPaid: number;
}