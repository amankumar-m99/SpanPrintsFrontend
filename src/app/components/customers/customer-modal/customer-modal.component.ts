import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  customerForm!: FormGroup;
  isSubmitting = false;
  showToast = false;

  @Input() editingCustomer!: Customer;
  @Output() successAction = new EventEmitter<Customer>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private customerService: CustomerService) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.email]],
      primaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhoneNumber: ['']
    });
    if (this.editingCustomer != null) {
      this.customerForm.patchValue(this.editingCustomer);
    }
  }

  addCustomer(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    let newCustomer: Customer = {
      uuid: crypto.randomUUID(),
      dbid: -1,
      createdAt: new Date(),
      ...this.customerForm.value
    };
    this.customerService.createCustomer(newCustomer).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.customerForm.reset();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  get username() { return this.customerForm.get('username'); }
  get primaryPhoneNumber() { return this.customerForm.get('primaryPhoneNumber'); }
  get email() { return this.customerForm.get('email'); }

}
