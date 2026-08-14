import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Customer } from '../../model/customer/customer.model';
import { CreateCustomerRequest } from '../../model/customer/create-customer-request.model';
import { UpdateCustomerRequest } from '../../model/customer/update-customer-request.model';
import { CustomerFilterRequest } from '../../model/customer/customer-filter-request.model';
import { CustomerPagination } from '../../model/customer/customer-pagination.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private url = Constant.API_URL + '/customers';

  constructor(private http: HttpClient) { }

  createCustomer(customer: CreateCustomerRequest) {
    return this.http.post<Customer>(this.url, customer);
  }

  updateCustomer(id: number, customer: UpdateCustomerRequest) {
    return this.http.put<Customer>(`${this.url}/id/${id}`, customer);
  }

  searchCustomersByName(name: string) {
    return this.http.get<Customer[]>(`${this.url}/search/name/${name}`);
  }

  searchCustomersByPhoneNumber(phoneNumber: string) {
    return this.http.get<Customer[]>(`${this.url}/search/phoneNumber/${phoneNumber}`);
  }

  getCustomerById(id: number) {
    return this.http.get<Customer>(`${this.url}/id/${id}`);
  }

  getCustomerByUuid(uuid: string) {
    return this.http.get<Customer>(`${this.url}/uuid/${uuid}`);
  }

  getAllCustomers() {
    return this.http.get<Customer[]>(this.url);
  }

  getCustomersPaginated(pageNumber: number, pageSize: number, filter: CustomerFilterRequest) {
    const paginationRequest = {
      'pageNumber': pageNumber,
      'pageSize': pageSize
    }
    const body = {
      ...filter,
      paginationRequest
    };

    return this.http.post<CustomerPagination>(`${this.url}/paginated`, body);
  }

  deleteCustomerById(id: number) {
    return this.http.delete<any>(`${this.url}/id/${id}`);
  }

  deleteCustomerByUuid(uuid: string) {
    return this.http.delete<any>(`${this.url}/uuid/${uuid}`);
  }

  deleteAllCustomers() {
    return this.http.delete<any>(this.url);
  }
}
