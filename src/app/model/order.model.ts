export interface Order {
    id: number,
    customerName: string,
    phone: string,
    address: string,
    jobType: string,
    count: number,
    dateOfDelivery: Date,
    totalAmount: number,
    depositAmount: number,
    note: string,
    bookNumber: number,
    wBookNumber: number,
    description: string,
    discountedAmount: number,
    pendingAmount: number,
    paymentStatus: string,
    createdAt: Date
}
