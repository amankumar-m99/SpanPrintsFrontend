import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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

export class CustomerModalComponent implements OnInit, OnChanges {
  customerForm!: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @ViewChild('addCustomerModalCloseBtn') addCustomerModalCloseBtn!: ElementRef;
  @Input() customer: Customer | null = null;
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.customer != null) {
      this.isEditMode = true;
      this.customerForm.patchValue(this.customer);
    } else {
      this.isEditMode = false;
    }
  }

  submitForm(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.addCustomer();
    }
    else {
      this.editCustomer();
    }
  }

  addCustomer(): void {
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
        this.addCustomerModalCloseBtn.nativeElement.click();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        this.addCustomerModalCloseBtn.nativeElement.click();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  editCustomer(): void {
    this.isSubmitting = true;
    let newCustomer: Customer = {
      uuid: this.customer?.uuid,
      id: this.customer?.id,
      createdAt: new Date(),
      ...this.customerForm.value
    };
    this.customerService.updateCustomer(newCustomer).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.customerForm.reset();
        this.addCustomerModalCloseBtn.nativeElement.click();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        this.addCustomerModalCloseBtn.nativeElement.click();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  get username() { return this.customerForm.get('username'); }
  get primaryPhoneNumber() { return this.customerForm.get('primaryPhoneNumber'); }
  get email() { return this.customerForm.get('email'); }

}
