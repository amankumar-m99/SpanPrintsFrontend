import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { LedgerEntry } from '../../model/ledger/ledger-entry.model';
import { CreateLedgerEntryRequest } from '../../model/ledger/create-ledger-entry-request.model';
import { UpdateLedgerEntryRequest } from '../../model/ledger/update-ledger-entry-request.model';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {

  private url = Constant.API_URL + '/ledgerentries';

  constructor(private http: HttpClient) { }

  createExpense(data: CreateLedgerEntryRequest) {
    return this.http.post<LedgerEntry>(this.url, data);
  }

  updateExpense(id: number, data: UpdateLedgerEntryRequest) {
    return this.http.put<LedgerEntry>(`${this.url}/id/${id}`, data);
  }

  getAllExpenses() {
    return this.http.get<LedgerEntry[]>(this.url);
  }

  deleteAllExpenses() {
    return this.http.delete(this.url);
  }

  deleteExpenseByUuid(uuid: string) {
    return this.http.delete(`${this.url}/uuid/${uuid}`);
  }
}
