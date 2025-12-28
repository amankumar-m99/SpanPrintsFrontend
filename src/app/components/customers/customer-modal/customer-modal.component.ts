import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../model/customer.model';
import { CustomerService } from '../../../services/customer/customer.service';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './customer-modal.component.html',
  styleUrl: './customer-modal.component.css'
})


export class CustomerModalComponent implements OnInit {
  customers: Customer[] = [];
  customerForm!: FormGroup;
  isSubmitting = false;
  editingCustomer!: Customer;
  showToast = false;
  @Output() successAction = new EventEmitter<Customer>();

  constructor(private fb: FormBuilder, private customerService: CustomerService) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.email]],
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
    this.customerService.createCustomer(newCustomer).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        alert(errorMessage);
      }
    });

    // Simulate backend save
    setTimeout(() => {
      this.customers.unshift(newCustomer);
      this.customerForm.reset();
      this.isSubmitting = false;
    }, 2000);
  }

  editCustomer(customer: Customer) {
    this.customerForm.patchValue(customer);
    this.editingCustomer = customer;
  }

  get username() { return this.customerForm.get('username'); }
  get primaryPhoneNumber() { return this.customerForm.get('primaryPhoneNumber'); }

}
