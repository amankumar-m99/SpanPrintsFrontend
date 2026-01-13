export interface AddToInventoryRequest {
    vendorId: number;
    itemId: number;
    count: number;
    rate: number;
    amountPaid: number;
}