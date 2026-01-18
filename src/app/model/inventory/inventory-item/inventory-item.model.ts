export interface InventoryItem {

    id: number;
    uuid: string;
    name: string;
    description: string;
    availableCount: number;
    rate: number;
    updatedAt: string;
    createdAt: string;
    inventoryId: number;
    inventoryHistoryIds: number[];

}