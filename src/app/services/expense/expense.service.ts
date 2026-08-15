import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { CreateExpenseRequest } from '../../model/expense/create-expense-request.model';
import { Expense } from '../../model/expense/expense.model';
import { UpdateExpenseRequest } from '../../model/expense/update-expense-request.model';
import { ExpenseFilterRequest } from '../../model/expense/expense-filter-request.model';
import { ExpensePagination } from '../../model/expense/expense-pagination.model';

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

  getExpensesPaginated(pageNumber: number, pageSize: number, filter?: ExpenseFilterRequest) {
    const paginationRequest = {
      pageNumber,
      pageSize
    };

    const body = {
      ...filter,
      paginationRequest
    };

    return this.http.post<ExpensePagination>(`${this.url}/paginated`, body);
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
