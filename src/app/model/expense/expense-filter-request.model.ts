export interface ExpenseFilterRequest {
  dateOfExpenseFrom?: string | null;
  dateOfExpenseTo?: string | null;
  expenseType?: string | null;
  description?: string | null;
  amountMin?: number | null;
  amountMax?: number | null;
}
