export interface InventoryHistory {
    id: number;
    uuid: string;
    quantity: number;
    rate: number;
    amountPaid: number;
    itemId: number;
    vendorId: number;
    updatedAt: string;
    createdAt: string;
}
