import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { Vendor } from '../../model/vendor/vendor.model';
import { CreateVendorRequest } from '../../model/vendor/create-vendor-request.model';
import { UpdateVendorRequest } from '../../model/vendor/update-vendor-request.model';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private url = Constant.API_URL + '/vendor';

  constructor(private http: HttpClient) { }

  createVendor(vendor: CreateVendorRequest) {
    return this.http.post<Vendor>(this.url, vendor);
  }

  updateVendor(vendor: UpdateVendorRequest) {
    return this.http.put<Vendor>(this.url, vendor);
  }

  getVendorById(id: number) {
    return this.http.get<Vendor>(this.url + '/id/' + id);
  }

  getVendorByUuid(uuid: string) {
    return this.http.get<Vendor>(this.url + '/uuid/' + uuid);
  }

  getAllVendors() {
    return this.http.get<Vendor[]>(this.url + 's');
  }

  deleteVendorByUuid(uuid: string) {
    return this.http.delete<any>(this.url + '/uuid/' + uuid);
  }

  deleteAllVendors() {
    return this.http.delete<any>(this.url + 's');
  }
}
