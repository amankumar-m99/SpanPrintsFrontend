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
  isSubmitting = false;
  editingCustomer!: Customer | null;
  showToast = false;
  toastType = 'info';
  toastMsg = '';
  deleteCustomerMsg = '';
  deleteAllCustomersMsg = '';
  toBeDeletedCustomer !: Customer | null;
  isRefreshTableData = false;

  @ViewChild('launchCustomerModalButton') launchCustomerModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteCustomerButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllCustomersButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private router: Router,
    private customerService: CustomerService) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        this.customers = res;
        if (this.isRefreshTableData) {
          this.toastType = "success";
          this.toastMsg = "Customers data refreshed.";
          this.showToast = true;
          this.isRefreshTableData = false;
        }
      },
      error: (err) => {
        this.toastType = "error";
        this.toastMsg = err?.error?.message || 'Error loading customers';
        this.showToast = true;
        this.isRefreshTableData = false;
      },
    });
  }

  refreshTable(): void {
    this.isRefreshTableData = true;
    this.loadCustomers();
  }

  addCustomer(): void {
    this.editingCustomer = null;
    this.launchCustomerModalButton.nativeElement.click();
  }

  editCustomer(customer: Customer) {
    this.editingCustomer = customer;
    this.launchCustomerModalButton.nativeElement.click();
  }

  askDeleteCustomer(customer: Customer) {
    this.deleteCustomerMsg = `Delete customer ${customer.name}?`;
    this.toBeDeletedCustomer = customer;
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  deleteCustomer() {
    if (this.toBeDeletedCustomer) {
      this.customerService.deleteCustomerByUuid(this.toBeDeletedCustomer.uuid).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.uuid !== this.toBeDeletedCustomer?.uuid);
          this.toastType = "warning";
          this.toastMsg = "Customer deleted";
          this.showToast = true;
        },
        error: (err) => {
          this.toastType = "error";
          this.toastMsg = err?.error?.message || 'Error deleting customer';
          this.showToast = true;
        },
      });
    }
  }

  askDeleteAllCustomers(): void {
    this.deleteAllCustomersMsg = 'Delete all customers ?';
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  deleteAllCustomers(): void {
    this.customerService.deleteAllCustomers().subscribe({
      next: () => {
        this.customers = [];
        this.toastType = "warning";
        this.toastMsg = "All Customers deleted";
        this.showToast = true;
      },
      error: (err) => {
        this.toastType = "error";
        this.toastMsg = err?.error?.message || 'Error deleting customers';
        this.showToast = true;
      },
    });
  }

  customerSuccess(customer: Customer): void {
    if (this.editingCustomer) {
      this.editingCustomer.email = customer.email;
      this.editingCustomer.name = customer.name;
      this.editingCustomer.primaryPhoneNumber = customer.primaryPhoneNumber;
      this.editingCustomer.alternatePhoneNumber = customer.alternatePhoneNumber;
      this.toastMsg = "Customer updated.";
    }
    else {
      this.customers.push(customer);
      this.toastMsg = "Customer added.";
    }
    this.toastType = "success";
    this.showToast = true;
  }

  customerError(errorStr: string): void {
    this.toastMsg = errorStr;
    this.toastType = "error";
    this.showToast = true;
  }

  toastCloseAction(): void {
    this.showToast = false
  }

  openCustomerProfile(customer: Customer) {
    this.router.navigate(['/dashboard/customer', customer.uuid]);
  }

}
