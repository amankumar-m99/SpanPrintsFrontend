import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { CreateExpenseRequest } from '../../model/expense/create-expense-request.model';
import { Expense } from '../../model/expense/expense.model';
import { UpdateExpenseRequest } from '../../model/expense/update-expense-request.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private url = Constant.API_URL + '/expenses';

  constructor(private http: HttpClient) { }

  createExpense(data: CreateExpenseRequest) {
    return this.http.post<Expense>(this.url, data);
  }

  getAllExpenses() {
    return this.http.get<Expense[]>(this.url);
  }

  getExpenseByUuid(uuid: String) {
    return this.http.get<Expense>(`${this.url}/uuid/${uuid}`);
  }

  updateExpense(data: UpdateExpenseRequest) {
    return this.http.put<Expense>(`${this.url}`, data);
  }

  deleteAllExpenses() {
    return this.http.delete(this.url);
  }

  deleteExpenseByUuid(uuid: string) {
    return this.http.delete(`${this.url}/uuid/${uuid}`);
  }
}
