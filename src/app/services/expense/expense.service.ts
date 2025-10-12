import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { Expense } from '../../model/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private expenseUrl = Constant.API_URL + '/expense';

  constructor(private http: HttpClient) { }

  addExpense(data: any) {
    return this.http.post<Expense>(this.expenseUrl, data);
  }

  getAllExpenses() {
    return this.http.get<Expense[]>(this.expenseUrl);
  }
}
