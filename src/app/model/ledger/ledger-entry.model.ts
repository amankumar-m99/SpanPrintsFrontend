export interface LedgerEntry {
    id: number;
	uuid: string;
	createdAt: string;
	updatedAt: string;
    amount: number;
    ledgerEntryType: string;
    ledgerEntrySource: string;
    transactionDateTime: string;
    printJobUuid: string;
    expenseUuid: string;
    investmentUuid: string;
    addedByBy: string;
    addedById: number;
}
