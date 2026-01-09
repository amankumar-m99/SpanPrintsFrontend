export interface CreateExpenseRequest {
    expenseType: string;
    amount: number;
    dateOfExpense: string;
    description: string;
}
