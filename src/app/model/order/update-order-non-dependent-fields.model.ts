export interface UpdateOrderNonDependentFieldsRequest {
    uuid: string;
    printJobTypeId: number;
    quantity: number;
    bookNumber: number;
    dateOfPlaced: Date;
    dateOfDelivery: Date;
    totalAmount: number;
    discountedAmount: number;
    note: string;
    description: string;
    printJobStatus: string;
}
