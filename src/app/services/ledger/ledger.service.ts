import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { LedgerEntry } from '../../model/ledger/ledger-entry.model';
import { CreateLedgerEntryRequest } from '../../model/ledger/create-ledger-entry-request.model';
import { UpdateLedgerEntryRequest } from '../../model/ledger/update-ledger-entry-request.model';
import { LedgerFilterRequest } from '../../model/ledger/ledger-filter-request.model';
import { LedgerPagination } from '../../model/ledger/ledger-pagination.model';

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

  getAllLedgerEntriesPaginated(pageNumber: number, pageSize: number, filter?: LedgerFilterRequest) {
    const paginationRequest = {
      pageNumber,
      pageSize
    };

    const body = {
      ...filter,
      paginationRequest
    };

    return this.http.post<LedgerPagination>(`${this.url}/paginated`, body);
  }

  deleteAllExpenses() {
    return this.http.delete(this.url);
  }

  deleteExpenseByUuid(uuid: string) {
    return this.http.delete(`${this.url}/uuid/${uuid}`);
  }
}
