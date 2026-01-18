export interface CreateInventoryItemRequest {
    name: string;
    rate: number;
    description: string;
    count: number;
    addToLedger: boolean;
}