export interface OrderFilterRequest {
    jobTypeIds?: string[];
    paymentStatuses?: string[];
    orderStatuses?: string[];
    quantityMin?: number | null;
    quantityMax?: number | null;
    totalAmountMin?: number | null;
    totalAmountMax?: number | null;
    discountedAmountMin?: number | null;
    discountedAmountMax?: number | null;
    pendingAmountMin?: number | null;
    pendingAmountMax?: number | null;
    deliveryDateMin?: string | null;
    deliveryDateMax?: string | null;
    placedOnMin?: string | null;
    placedOnMax?: string | null;
    bookNumber?: string | null;
    customerName?: string | null;
    customerPhone?: string | null;
}
