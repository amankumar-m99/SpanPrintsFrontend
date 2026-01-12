import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { Order } from '../../model/order/order.model';
import { CreatePrintJobTypeRequest } from '../../model/order/create-printjobtype-request.model';
import { UpdatePrintJobTypeRequest } from '../../model/order/update-printjobtype-request.model';
import { PrintJobType } from '../../model/order/printjobtype.model';

@Injectable({
  providedIn: 'root'
})
export class PrintjobtypeService {

  private url = Constant.API_URL + '/printjob';

  constructor(private http: HttpClient) { }


  createPrintJobType(data: CreatePrintJobTypeRequest) {
    return this.http.post<Order>(this.url, data);
  }

  updatePrintJobType(data: UpdatePrintJobTypeRequest) {
    return this.http.put<Order>(this.url, data);
  }

  getAllJobTypes() {
    return this.http.get<PrintJobType[]>(this.url);
  }

  deleteJobTypeByUuid(uuid: string) {
    return this.http.delete<any>(this.url + '/uuid/' + uuid);
  }

  deleteAllJobTypes() {
    return this.http.delete<any>(this.url + 's');
  }
}
