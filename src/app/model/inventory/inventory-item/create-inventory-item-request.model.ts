export interface CreateInventoryItemRequest {
    name: string;
    code: string;
    rate: number;
    description: string;
    quantity: number;
    addToLedger: boolean;
}