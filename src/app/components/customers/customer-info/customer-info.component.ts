import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer/customer.service';
import { Customer } from '../../../model/customer/customer.model';
import { CommonModule } from '@angular/common';
import { CustomerModalComponent } from "../customer-modal/customer-modal.component";
import { ToastComponent } from "../../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../../utility/confirm-dialog/confirm-dialog.component";
import { FormsModule } from '@angular/forms';
import { Constant } from '../../../constant/Constant';
import { OrderService } from '../../../services/order/order.service';
import { Order } from '../../../model/order/order.model';
import { TimeElapsedPipe } from "../../../pipes/timeElapsed/time-elapsed.pipe";

@Component({
  selector: 'app-customer-info',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomerModalComponent, ToastComponent, ConfirmDialogComponent, TimeElapsedPipe],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.css'
})
export class CustomerInfoComponent implements OnInit {

  customerUuid !: string;
  customer !: Customer | null;
  orders !: Order[];
  receivedAmount = 0;
  discountedAmount = 0;
  pendingAmount = 0;

  errorMsg = '';
  copied = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';
  showToast = false;

  enteredUuid = '';
  isUuidValid = false;
  private uuidRegex: RegExp = Constant.UUID_REGEX;

  constructor(private router: Router, private route: ActivatedRoute, private customerService: CustomerService, private orderService: OrderService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.customerUuid = uuid;
        this.fetchCustomerDetails();
        this.fetchOrderDetails();
      }
    });
  }

  fetchCustomerDetails() {
    this.customerService.getCustomerByUuid(this.customerUuid).subscribe({
      next: (res) => {
        this.customer = res;
        this.errorMsg = '';
        this.deleteMsg = `Delete customer ${this.customer.name}?`;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load customer's data!";
      }
    });
  }

  fetchOrderDetails() {
    this.orderService.getAllOrdersByCustomerUuid(this.customerUuid).subscribe({
      next: (res) => {
        this.orders = res;
        this.errorMsg = '';
        this.updateOrderValues();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load order's data!";
      }
    });
  }

  updateOrderValues() {
    let rAmount = 0;
    let dAmount = 0;
    let pAmount = 0;
    for(let order of this.orders){
      rAmount += order.depositAmount;
      dAmount += order.discountedAmount;
      pAmount += order.pendingAmount;
    }
    this.receivedAmount = rAmount;
    this.discountedAmount = dAmount;
    this.pendingAmount = pAmount;
  }

  deleteCustomer() {
    if (this.customer) {
      this.customerService.deleteCustomerByUuid(this.customer.uuid).subscribe({
        next: () => {
          this.customer = null;
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
    if (this.customer?.uuid) {
      navigator.clipboard.writeText(this.customer.uuid).then(() => {
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
