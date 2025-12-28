import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../model/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private url = Constant.API_URL + '/customer';

  constructor(private http: HttpClient) { }

  createCustomer(customer:Customer){
    return this.http.post<Customer>(this.url, customer);
  }

  getAllCustomers(){
    return this.http.get<Customer[]>(this.url + 's');
  }
}
