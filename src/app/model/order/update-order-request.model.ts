export interface UpdateOrderRequest {
    id: number;
    customerId: number,
    jobType: string,
    count: number,
    dateOfDelivery: Date,
    bookNumber: number,
    wBookNumber: number,
    totalAmount: number,
    discountedAmount: number,
    depositAmount: number,
    pendingAmount: number,
    paymentStatus: string,
    note: string,
    description: string,
}
