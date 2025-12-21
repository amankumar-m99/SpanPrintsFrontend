import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer } from '../../model/customer.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})

export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  customerForm!: FormGroup;
  isSubmitting = false;
  editingCustomer!: Customer;

  constructor(private fb: FormBuilder, 
      private router: Router) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      primaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhoneNumber: ['']
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

  openCustomerProfile(customer: Customer) {
  this.router.navigate(['/customers', customer.uuid]);
}


}
