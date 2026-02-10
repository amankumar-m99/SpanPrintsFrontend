export interface UpdateLedgerEntryRequest {
    id: number;
    expenseType: string;
    amount: number;
    dateOfExpense: string;
    description: string;
}
