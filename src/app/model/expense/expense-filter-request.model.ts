export interface ExpenseFilterRequest {
  dateOfExpenseFrom?: string | null;
  dateOfExpenseTo?: string | null;
  expenseTypes?: string[] | null;
  description?: string | null;
  amountMin?: number | null;
  amountMax?: number | null;
}
