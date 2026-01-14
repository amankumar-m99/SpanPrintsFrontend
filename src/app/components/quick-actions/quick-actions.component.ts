import { Component } from '@angular/core';
import { CustomerModalComponent } from "../customers/customer-modal/customer-modal.component";
import { ToastComponent } from "../utility/toast/toast.component";
import { CommonModule } from '@angular/common';
import { VendorModalComponent } from "../vendors/vendor-modal/vendor-modal.component";
import { OrderModalComponent } from "../orders/order-modal/order-modal.component";
import { ExpenseModalComponent } from "../expenses/expense-modal/expense-modal.component";
import { PrintjobtypeModalComponent } from "../printjob/printjobtype-modal/printjobtype-modal.component";
import { InventoryItemModalComponent } from "../inventory/inventory-item-modal/inventory-item-modal.component";

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CustomerModalComponent, ToastComponent, CommonModule, VendorModalComponent, OrderModalComponent, ExpenseModalComponent, PrintjobtypeModalComponent, InventoryItemModalComponent],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent {

  showToast = false;
  toastType = 'info';
  toastMsg = '';

  showSuccessToastModal(msg: string): void {
    this.toastType = "success";
    this.toastMsg = msg;
    this.showToast = true;
  }

  showErrorToastModal(errorStr: string): void {
    this.toastType = "error";
    this.toastMsg = errorStr;
    this.showToast = true;
  }

  hideToastModal(): void {
    this.showToast = false
  }
}
