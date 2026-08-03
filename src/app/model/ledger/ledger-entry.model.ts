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
    addedByBy: string;
    addedById: number;
}
