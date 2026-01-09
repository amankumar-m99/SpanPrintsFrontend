export interface Expense {
    id: number;
    uuid: string;
    expenseType: string;
    amount: number;
    description: string;
    dateOfExpense: string;
    ledgerIds: number;
    updatedAt: string;
    createdAt: string;
    createdBy: string;
    createdById: number;
}
