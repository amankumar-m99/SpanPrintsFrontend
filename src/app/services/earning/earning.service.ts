import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { Transaction } from '../../model/transaction/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class EarningService {

  private earningsUrl = Constant.API_URL + '/transaction';

  constructor(private http: HttpClient) { }

  getAllTransactions() {
    return this.http.get<Transaction[]>(this.earningsUrl);
  }
}
