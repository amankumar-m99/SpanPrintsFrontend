import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../model/customer/customer.model';
import { CreateCustomer } from '../../model/customer/create-customer.model';
import { UpdateCustomer } from '../../model/customer/update-customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private url = Constant.API_URL + '/customer';

  constructor(private http: HttpClient) { }

  createCustomer(customer: CreateCustomer) {
    return this.http.post<Customer>(this.url, customer);
  }

  updateCustomer(customer: UpdateCustomer) {
    return this.http.put<Customer>(this.url, customer);
  }

  getCustomerByUuid(uuid: string) {
    return this.http.get<Customer>(this.url + '/uuid/' + uuid);
  }

  getAllCustomers() {
    return this.http.get<Customer[]>(this.url + 's');
  }

  deleteCustomerById(id: number) {
    return this.http.delete<any>(this.url + '/id/' + id);
  }

  deleteCustomerByUuid(uuid: string) {
    return this.http.delete<any>(this.url + '/uuid/' + uuid);
  }

  deleteAllCustomers() {
    return this.http.delete<any>(this.url + 's');
  }
}
