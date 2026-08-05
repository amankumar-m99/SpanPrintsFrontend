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
    printJobUuid: string;
    expenseUuid: string;
    investmentUuid: string;
    addedByBy: string;
    addedById: number;
}
