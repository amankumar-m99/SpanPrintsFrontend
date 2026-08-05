import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { CreateInvestmentRequest } from '../../model/investment/create-investment-request.model';
import { Investment } from '../../model/investment/investment.model';
import { UpdateInvestmentRequest } from '../../model/investment/update-investment-request.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {

  private url = Constant.API_URL + '/investments';

  constructor(private http: HttpClient) { }

  createInvestment(data: CreateInvestmentRequest) {
    return this.http.post<Investment>(this.url, data);
  }

  getAllInvestments() {
    return this.http.get<Investment[]>(this.url);
  }

  getInvestmentByUuid(uuid: String) {
    return this.http.get<Investment>(`${this.url}/uuid/${uuid}`);
  }

  updateInvestment(data: UpdateInvestmentRequest) {
    return this.http.put<Investment>(`${this.url}`, data);
  }

  deleteAllInvestments() {
    return this.http.delete(this.url);
  }

  deleteInvestmentByUuid(uuid: string) {
    return this.http.delete(`${this.url}/uuid/${uuid}`);
  }
}
