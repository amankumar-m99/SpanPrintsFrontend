import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { Order } from '../../model/order/order.model';
import { UpdateOrderRequest } from '../../model/order/update-order-request.model';
import { OrderPagination } from '../../model/order/order-pagination.model';
import { UpdateOrderStatusRequest } from '../../model/order/update-order-status.model';
import { UpdateOrderNonDependentFieldsRequest } from '../../model/order/update-order-non-dependent-fields.model';

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

  getAllOrdersPaginated(pageNumber: number, pageSize: number) {
    return this.http.get<OrderPagination>(`${this.url}/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  getAllOrdersPlacedToday() {
    return this.http.get<Order[]>(`${this.url}/today`);
  }

  getAllOrdersToBePreparedToday() {
    return this.http.get<Order[]>(`${this.url}/to-be-prepared-today`);
  }

  getAllOrdersToBeDeliveredToday() {
    return this.http.get<Order[]>(`${this.url}/to-be-deliver-today`);
  }

  getAllOrdersYetToDeliver() {
    return this.http.get<Order[]>(`${this.url}/yet-to-deliver`);
  }

  getAllOrdersByCustomerUuid(uuid: string) {
    return this.http.get<Order[]>(`${this.url}/customer-uuid/${uuid}`);
  }

  getOrderById(id: number) {
    return this.http.get<Order>(`${this.url}/id/${id}`);
  }

  getOrderByUuid(uuid: string) {
    return this.http.get<Order>(`${this.url}/uuid/${uuid}`);
  }

  markOrderAsPaid(uuid: string) {
    return this.http.patch<Order>(`${this.url}/mark-as-paid/${uuid}`, null);
  }

  updateOrderStatus(request: UpdateOrderStatusRequest) {
    return this.http.patch<Order>(`${this.url}/order-status`, request);
  }

  updateOrderNonDependentFields(data: UpdateOrderNonDependentFieldsRequest) {
    return this.http.put<Order>(`${this.url}/non-dependent`, data);
  }

  deleteOrderByUuid(uuid: string) {
    return this.http.delete<any>(`${this.url}/uuid/${uuid}`);
  }

  deleteAllOrders() {
    return this.http.delete<any>(this.url);
  }
}
