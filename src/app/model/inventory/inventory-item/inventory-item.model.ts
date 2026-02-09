export interface InventoryItem {

    id: number;
    uuid: string;
    name: string;
    code: string;
    description: string;
    quantity: number;
    rate: number;
    updatedAt: string;
    createdAt: string;
    inventoryId: number;
    inventoryHistoryIds: number[];

}