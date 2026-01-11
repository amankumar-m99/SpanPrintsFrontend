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
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;

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
          this.showToastComponent("success", "Customers data refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading customers');
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
    this.launchConfirmDeleteModal();
  }

  deleteCustomer() {
    if (this.tempCustomer) {
      this.customerService.deleteCustomerByUuid(this.tempCustomer.uuid).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.uuid !== this.tempCustomer?.uuid);
          this.showToastComponent("warning", "Customer deleted");
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting customer');
        },
      });
    }
  }

  askDeleteAllCustomers(): void {
    this.deleteMsg = 'Delete all customers?';
    this.launchConfirmDeleteModal();
  }

  deleteAllCustomers(): void {
    this.customerService.deleteAllCustomers().subscribe({
      next: () => {
        this.customers = [];
        this.showToastComponent("warning", "All customers deleted");
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error deleting customers');
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
    this.showToastComponent("success", this.toastMsg);
  }

  errorAction(errorStr: string): void {
    this.showToastComponent("error", errorStr);
  }

  launchCustomerModal(): void {
    this.launchCustomerModalButton.nativeElement.click();
  }

  launchConfirmDeleteModal(): void {
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  launchConfirmDeleteAllModal(): void {
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }

  openDetails(customer: Customer) {
    this.router.navigate(['/dashboard/customer', customer.uuid]);
  }

}
