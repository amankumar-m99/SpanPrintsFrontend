import { Expense } from "./expense.model";

export interface Transaction{
    id: number,
    amount:number,
    transactionType: string,
    transactionDomain: string,
    transactionDate: Date,
    transactionTime: Date,
    expenseId: number,
    printJobId: number,
    description: string
}