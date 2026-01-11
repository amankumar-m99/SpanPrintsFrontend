export interface Order {
    id: number;
    uuid: string;
    jobType: string;
    count: number;
    dateOfDelivery: Date;
    bookNumber: number;
    wBookNumber: number;
    totalAmount: number;
    discountedAmount: number;
    depositAmount: number;
    pendingAmount: number;
    paymentStatus: string;
    note: string;
    description: string;
    attachmentIds: number[];
    ledgerIds: number[];
    customerId: number;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    updatedAt: string;
    createdAt: string;
    createdBy: string;
    createdById: number;
}
