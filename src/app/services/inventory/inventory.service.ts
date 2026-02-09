import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { InventoryItem } from '../../model/inventory/inventory-item/inventory-item.model';
import { Inventory } from '../../model/inventory/inventory.model';
import { CreateInventoryItemRequest } from '../../model/inventory/inventory-item/create-inventory-item-request.model';
import { UpdateInventoryItemRequest } from '../../model/inventory/inventory-item/update-inventory-item-request.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private url = Constant.API_URL + '/inventory-items';

  constructor(private http: HttpClient) { }

  createInventoryItem(data: CreateInventoryItemRequest) {
    return this.http.post<InventoryItem>(this.url, data);
  }

  getAllInventoryItems() {
    return this.http.get<InventoryItem[]>(this.url);
  }

  getInventoryItemById(id: number) {
    return this.http.get<InventoryItem>(`${this.url}/id/${id}`);
  }

  updateInventoryItem(data: UpdateInventoryItemRequest) {
    return this.http.put<InventoryItem>(this.url, data);
  }

  deleteAllInventoryItems() {
    return this.http.delete<any>(this.url);
  }

  deleteInventoryItemById(id: number) {
    return this.http.delete<any>(`${this.url}/id/${id}`);
  }

  getAllInventoryRecords() {
    return this.http.get<Inventory[]>(this.url);
  }
}
