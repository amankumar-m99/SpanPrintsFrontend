import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { CreateInventoryItemRequest } from '../../model/inventory/inventory-item/create-inventory-item-request.model';
import { InventoryItem } from '../../model/inventory/inventory-item/inventory-item.model';
import { InventoryHistory } from '../../model/inventory/inventory-historty.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryHistoryService {

  private url = Constant.API_URL + '/inventory-history';

  constructor(private http: HttpClient) { }

  getAllInventoryHistories() {
    return this.http.get<InventoryHistory[]>(this.url);
  }

}
