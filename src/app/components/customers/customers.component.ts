import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer } from '../../model/customer.model';
import { Router } from '@angular/router';
import { CustomerModalComponent } from "./customer-modal/customer-modal.component";
import { CustomerService } from '../../services/customer/customer.service';
import { ToastComponent } from "../utility/toast/toast.component";

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomerModalComponent, ToastComponent],
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
  toBeDeletedCustomer !: Customer | null;

  @ViewChild('launchCustomerModalButton') launchCustomerModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteButton') launchConfirmDeleteButton!: ElementRef;

  constructor(private router: Router,
    private customerService: CustomerService) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        this.customers = res;
      },
      error: () => { },
    });
  }

  refreshTable(): void {
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
    this.deleteCustomerMsg = `Delete customer ${customer.username}?`;
    this.toBeDeletedCustomer = customer;
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  confirmDeleteCustomer() {
    if (this.toBeDeletedCustomer) {
      this.customerService.deleteCustomer(this.toBeDeletedCustomer.id).subscribe({
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

  customerSuccess(customer: Customer): void {
    if (this.editingCustomer) {
      this.editingCustomer.email = customer.email;
      this.editingCustomer.username = customer.username;
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
