import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { Order } from '../../model/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private expenseUrl = Constant.API_URL + '/printjob';

  constructor(private http: HttpClient) { }

  addOrder(data: any) {
    return this.http.post<Order>(this.expenseUrl, data);
  }

  getAllOrders() {
    return this.http.get<Order[]>(this.expenseUrl);
  }

}
