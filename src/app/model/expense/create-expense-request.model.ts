export interface CreateExpenseRequest {
    expenseType: string;
    amount: number;
    dateOfExpense: Date
    description: string;
}
