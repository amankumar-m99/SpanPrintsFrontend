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

@Component({
  selector: 'app-customer-info',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomerModalComponent, ToastComponent, ConfirmDialogComponent],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.css'
})
export class CustomerInfoComponent implements OnInit {

  customerUuid !: string;
  customer !: Customer | null;
  errorMsg = '';
  copied = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';
  showToast = false;

  enteredUuid = '';
  isUuidValid = false;
  private uuidRegex: RegExp = Constant.UUID_REGEX;

  constructor(private router: Router, private route: ActivatedRoute, private customerService: CustomerService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.customerUuid = uuid;
        this.fetchCustomerDetails(uuid);
      }
    });
  }

  fetchCustomerDetails(uuid: string) {
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
    this.showToastComponent("success", "Customer updated.")
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
