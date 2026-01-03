import { Component } from '@angular/core';
import { CustomerModalComponent } from "../customers/customer-modal/customer-modal.component";
import { ToastComponent } from "../utility/toast/toast.component";
import { Customer } from '../../model/customer.model';
import { CommonModule } from '@angular/common';
import { VendorModalComponent } from "../vendors/vendor-modal/vendor-modal.component";

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CustomerModalComponent, ToastComponent, CommonModule, VendorModalComponent],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent {

  showToast = false;
  toastType = 'info';
  toastMsg = '';

  toastCloseAction(): void {
    this.showToast = false
  }

  customerSuccess(msg: string): void {
    this.toastMsg = msg;
    this.toastType = "success";
    this.showToast = true;
  }

  errorToast(errorStr: string): void {
    this.toastMsg = errorStr;
    this.toastType = "error";
    this.showToast = true;
  }
}
