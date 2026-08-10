export interface InventoryHistory {
    id: number;
    uuid: string;
    amount: number;
    quantity: number;
    action: string;
    rate: number;
    amountPaid: number;
    itemId: number;
    inventoryItemId: number;
    vendorId: number;
    updatedAt: string;
    createdAt: string;
    description: string;
    dateOfTransaction: string;
}
