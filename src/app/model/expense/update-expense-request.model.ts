export interface UpdateExpenseRequest {
    id: number;
    expenseType: string;
    amount: number;
    dateOfExpense: string;
    description: string;
}
