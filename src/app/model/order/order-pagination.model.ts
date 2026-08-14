import { Order } from "./order.model";

export interface OrderPagination {
    elements: Order[];
    currentPageNumber: number;
    numberOfTotalPages: number;
    totalElements: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
}
