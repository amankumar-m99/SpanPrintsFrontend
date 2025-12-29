import { Component } from '@angular/core';
import { CustomerModalComponent } from "../customers/customer-modal/customer-modal.component";
import { ToastComponent } from "../utility/toast/toast.component";
import { Customer } from '../../model/customer.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CustomerModalComponent, ToastComponent, CommonModule],
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

  customerSuccess(): void {
    this.toastMsg = "Customer added.";
    this.toastType = "success";
    this.showToast = true;
  }

  customerError(errorStr: string): void {
    this.toastMsg = errorStr;
    this.toastType = "error";
    this.showToast = true;
  }
}
