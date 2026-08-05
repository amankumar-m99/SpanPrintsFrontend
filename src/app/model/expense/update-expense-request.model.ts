export interface UpdateExpenseRequest {
    id: number;
    uuid: string;
    expenseType: string;
    amount: number;
    dateOfExpense: string;
    description: string;
}
