import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer/customer.service';
import { Customer } from '../../../model/customer/customer.model';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../../utility/confirm-dialog/confirm-dialog.component";
import { FormsModule } from '@angular/forms';
import { Constant } from '../../../constant/Constant';
import { CustomerModalComponent } from '../../customers/customer-modal/customer-modal.component';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';
import { PrintjobtypeModalComponent } from "../../printjob/printjobtype-modal/printjobtype-modal.component";

@Component({
  selector: 'app-order-info',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomerModalComponent, ToastComponent, ConfirmDialogComponent, PrintjobtypeModalComponent],
  templateUrl: './order-info.component.html',
  styleUrl: './order-info.component.css'
})
export class OrderInfoComponent implements OnInit {

  orderUuid !: string;
  order !: Order | null;
  errorMsg = '';
  copied = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';
  showToast = false;

  enteredUuid = '';
  isUuidValid = false;
  private uuidRegex: RegExp = Constant.UUID_REGEX;

  constructor(private router: Router, private route: ActivatedRoute, private orderService: OrderService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.orderUuid = uuid;
        this.fetchCustomerDetails();
      }
    });
  }

  fetchCustomerDetails() {
    this.orderService.getOrderByUuid(this.orderUuid).subscribe({
      next: (res) => {
        this.order = res;
        this.errorMsg = '';
        this.deleteMsg = `Delete customer ${this.order.uuid}?`;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load order details!";
      }
    });
  }

  deleteCustomer() {
    if (this.order) {
      this.orderService.deleteOrderByUuid(this.order.uuid).subscribe({
        next: () => {
          this.order = null;
          this.showToastComponent("warning", "Customer deleted");
          this.router.navigate(['/dashboard/customers']);
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting customer');
        },
      });
    }
  }

  copyUuid() {
    if (this.order?.uuid) {
      navigator.clipboard.writeText(this.order.uuid).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1500);
      });
    }
  }

  customerSuccess(customer: Customer): void {
    this.showToastComponent("success", "Customer updated.");
    this.fetchCustomerDetails();
  }

  customerError(errorStr: string): void {
    this.showToastComponent("error", errorStr)
  }

  reload() {
    window.location.reload();
  }

  validateUuid() {
    this.isUuidValid = this.uuidRegex.test(this.enteredUuid.trim());
  }

  navigateWithUuid() {
    if (!this.isUuidValid) return;
    this.router.navigate(['/dashboard/customer', this.enteredUuid.trim()]);
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.enteredUuid = text.trim();
      this.validateUuid();
    } catch {
      alert('Clipboard access denied');
    }
  }

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }

}
