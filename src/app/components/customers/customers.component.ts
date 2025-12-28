import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  customerForm!: FormGroup;
  isSubmitting = false;
  editingCustomer!: Customer;
  showToast = false;

  constructor(private fb: FormBuilder, private customerService: CustomerService,
    private router: Router) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      primaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhoneNumber: ['']
    });
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

  addCustomer(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const newCustomer: Customer = {
      uuid: crypto.randomUUID(),
      dbid: Date.now(),
      createdAt: new Date(),
      ...this.customerForm.value
    };

    // Simulate backend save
    setTimeout(() => {
      this.customers.unshift(newCustomer);
      this.customerForm.reset();
      this.isSubmitting = false;
    }, 800);
  }

  editCustomer(customer: Customer) {
    this.customerForm.patchValue(customer);
    this.editingCustomer = customer;
  }

  deleteCustomer(customer: Customer) {
    if (!confirm(`Delete customer ${customer.username}?`)) return;
    this.customers = this.customers.filter(c => c.uuid !== customer.uuid);
  }

  customerAddedSuccess(customer: Customer): void {
    this.showToast = true;
    this.customers.push(customer);
  }

  openCustomerProfile(customer: Customer) {
    this.router.navigate(['/dashboard/customer', customer.uuid]);
  }

}
