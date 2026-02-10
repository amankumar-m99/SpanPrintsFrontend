export interface LedgerEntry {
    id: number;
	uuid: string;
	createdAt: string;
	updatedAt: string;
    amount: number;
    ledgerType: string;
    ledgerSource: string;
    transactionDateTime: string;
    description: string;
    printJobId: number;
    expenseId: number;
    addedByBy: string;
    addedById: number;
}
