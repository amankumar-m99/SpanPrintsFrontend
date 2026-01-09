import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { Expense } from '../../model/expense/expense.model';
import { CreateExpenseRequest } from '../../model/expense/create-expense-request.model';
import { UpdateExpenseRequest } from '../../model/expense/update-expense-request.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private url = Constant.API_URL + '/expense';

  constructor(private http: HttpClient) { }

  createExpense(data: CreateExpenseRequest) {
    return this.http.post<Expense>(this.url, data);
  }

  updateExpense(data: UpdateExpenseRequest) {
    return this.http.put<Expense>(this.url, data);
  }

  getAllExpenses() {
    return this.http.get<Expense[]>(this.url);
  }

  deleteAllExpenses() {
    return this.http.delete(this.url + 's');
  }

  deleteExpenseByUuid(uuid: string) {
    return this.http.delete(this.url + '/uuid/' + uuid);
  }
}
