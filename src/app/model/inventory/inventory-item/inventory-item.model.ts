export interface InventoryItem {

    id: number;
    uuid: string;
    name: string;
    description: string;
    rate: number;
    updatedAt: string;
    createdAt: string;
    inventoryId: number;
    inventoryHistoryIds: number[];

}