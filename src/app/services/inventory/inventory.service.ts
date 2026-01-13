import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { InventoryItem } from '../../model/inventory/inventory-item/inventory-item.model';
import { Inventory } from '../../model/inventory/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private url = Constant.API_URL + '/transaction';

  constructor(private http: HttpClient) { }

  getAllInventoryItems() {
    return this.http.get<InventoryItem[]>(this.url);
  }

  getAllInventoryRecords() {
    return this.http.get<Inventory[]>(this.url);
  }
}
