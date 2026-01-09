export interface UpdateExpenseRequest {
    id: number;
    expenseType: string;
    amount: number;
    dateOfExpense: Date
    description: string;
}
