import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../model/customer/customer.model';
import { CustomerService } from '../../../services/customer/customer.service';
import { UpdateCustomerRequest } from '../../../model/customer/update-customer-request.model';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './customer-modal.component.html',
  styleUrl: './customer-modal.component.css'
})

export class CustomerModalComponent implements OnInit, OnChanges {
  modalForm!: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: UpdateCustomerRequest | null = null;
  @Output() successAction = new EventEmitter<Customer>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: CustomerService) { }

  ngOnInit(): void {
    this.modalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      address: [''],
      primaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhoneNumber: ['', [Validators.pattern(/^\d{10}$/)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.model != null) {
      this.isEditMode = true;
      this.modalForm?.patchValue(this.model);
    } else {
      this.isEditMode = false;
      this.modalForm?.reset();
    }
  }

  get name() { return this.modalForm.get('name'); }
  get email() { return this.modalForm.get('email'); }
  get address() { return this.modalForm.get('address'); }
  get primaryPhoneNumber() { return this.modalForm.get('primaryPhoneNumber'); }
  get alternatePhoneNumber() { return this.modalForm.get('alternatePhoneNumber'); }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#customerModalFormSubmitButton') as HTMLElement)?.click();
  }

  submitForm(): void {
    if (this.modalForm.invalid) {
      this.modalForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.updateEntity();
    }
    else {
      this.createEntity();
    }
  }

  updateEntity(): void {
    this.isSubmitting = true;
    let newModel: UpdateCustomerRequest = {
      id: this.model?.id,
      ...this.modalForm.value
    };
    this.service.updateCustomer(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while updating customer';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  createEntity(): void {
    this.isSubmitting = true;
    let newModel: Customer = {
      ...this.modalForm.value
    };
    this.service.createCustomer(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while creating customer';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#customerModalCloseBtn') as HTMLElement)?.click();
  }

}
