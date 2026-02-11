import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { Order } from '../../model/order/order.model';
import { UpdateOrderRequest } from '../../model/order/update-order-request.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private url = Constant.API_URL + '/printjobs';

  constructor(private http: HttpClient) { }

  createOrder(data: FormData) {
    return this.http.post<Order>(this.url, data);
  }

  updateOrder(id: number, data: UpdateOrderRequest) {
    return this.http.put<Order>(`${this.url}/id/${id}`, data);
  }

  getAllOrders() {
    return this.http.get<Order[]>(this.url);
  }

  getOrderById(id: number) {
    return this.http.get<Order>(`${this.url}/id/${id}`);
  }

  getOrderByUuid(uuid: string) {
    return this.http.get<Order>(`${this.url}/uuid/${uuid}`);
  }

  deleteOrderByUuid(uuid: string) {
    return this.http.delete<any>(`${this.url}/uuid/${uuid}`);
  }

  deleteAllOrders() {
    return this.http.delete<any>(this.url);
  }
}
