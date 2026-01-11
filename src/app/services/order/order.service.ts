import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { Order } from '../../model/order/order.model';
import { UpdateOrderRequest } from '../../model/order/update-order-request.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private url = Constant.API_URL + '/printjob';

  constructor(private http: HttpClient) { }

  createOrder(data: FormData) {
    return this.http.post<Order>(this.url, data);
  }

  updateOrder(data: UpdateOrderRequest) {
    return this.http.put<Order>(this.url, data);
  }

  getAllOrders() {
    return this.http.get<Order[]>(this.url);
  }

  deleteOrderByUuid(uuid: string) {
    return this.http.delete<any>(this.url + '/uuid/' + uuid);
  }

  deleteAllOrders() {
    return this.http.delete<any>(this.url + 's');
  }
}
