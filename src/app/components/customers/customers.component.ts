import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../model/customer/customer.model';
import { Router } from '@angular/router';
import { CustomerModalComponent } from "./customer-modal/customer-modal.component";
import { CustomerService } from '../../services/customer/customer.service';
import { ToastComponent } from "../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, CustomerModalComponent, ToastComponent, ConfirmDialogComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})

export class CustomersComponent implements OnInit {

  customers: Customer[] = [];
  tempCustomer !: Customer | null;
  isSubmitting = false;
  isRefreshingData = false;
  showToast = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';

  @ViewChild('launchCustomerModalButton') launchCustomerModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteCustomerButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllCustomersButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private router: Router,
    private customerService: CustomerService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        this.customers = res;
        if (this.isRefreshingData) {
          this.setToast("success", "Customers data refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.setToast("error", err?.error?.message || 'Error loading customers');
        this.isRefreshingData = false;
      },
    });
  }

  refreshData(): void {
    this.isRefreshingData = true;
    this.loadData();
  }

  addCustomer(): void {
    this.tempCustomer = null;
    this.launchCustomerModal();
  }

  editCustomer(customer: Customer) {
    this.tempCustomer = customer;
    this.launchCustomerModal();
  }

  askDeleteCustomer(customer: Customer): void {
    this.deleteMsg = `Delete customer ${customer.name}?`;
    this.tempCustomer = customer;
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  deleteCustomer() {
    if (this.tempCustomer) {
      this.customerService.deleteCustomerByUuid(this.tempCustomer.uuid).subscribe({
        next: () => {
          // this.customers.splice(this.deleteIndex, 1);
          this.customers = this.customers.filter(c => c.uuid !== this.tempCustomer?.uuid);
          this.setToast("warning", "Customer deleted");
        },
        error: (err) => {
          this.setToast("error", err?.error?.message || 'Error occured while deleting customer');
        },
      });
    }
  }

  askDeleteAllCustomers(): void {
    this.deleteMsg = 'Delete all customers?';
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  deleteAllCustomers(): void {
    this.customerService.deleteAllCustomers().subscribe({
      next: () => {
        this.customers = [];
        this.setToast("warning", "All customers deleted");
      },
      error: (err) => {
        this.setToast("error", err?.error?.message || 'Error deleting customers');
      },
    });
  }

  successAction(customer: Customer): void {
    if (this.tempCustomer) {
      let index = this.customers.findIndex(c => c.id === this.tempCustomer?.id);
      if (index !== -1) {
        this.customers[index] = { ...this.tempCustomer };
      }
      this.toastMsg = "Customer updated.";
    }
    else {
      this.customers.push(customer);
      this.toastMsg = "Customer added.";
    }
    this.toastType = "success";
    this.showToast = true;
  }

  errorAction(errorStr: string): void {
    this.setToast("error", errorStr);
  }

  launchCustomerModal(): void {
    this.launchCustomerModalButton.nativeElement.click();
  }

  setToast(type: string, msg: string): void {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
  }

  toastCloseAction(): void {
    this.showToast = false
  }

  openDetails(customer: Customer) {
    this.router.navigate(['/dashboard/customer', customer.uuid]);
  }

}
