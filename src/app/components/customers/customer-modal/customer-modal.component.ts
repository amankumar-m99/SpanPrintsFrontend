import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../model/customer/customer.model';
import { CustomerService } from '../../../services/customer/customer.service';
import { UpdateCustomerRequest } from '../../../model/customer/update-customer-request.model';
import { CreateCustomerRequest } from '../../../model/customer/create-customer-request.model';
import { RequiredFieldMarkerComponent } from "../../utility/required-field-marker/required-field-marker.component";

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RequiredFieldMarkerComponent],
  templateUrl: './customer-modal.component.html',
  styleUrl: './customer-modal.component.css'
})

export class CustomerModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: Customer | null = null;
  @Output() successAction = new EventEmitter<Customer>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: CustomerService) { }

  ngOnInit(): void {
    if (!this.modalForm) {
      this.initModalForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.modalForm) {
      this.initModalForm();
    }
    if (this.model != null) {
      this.isEditMode = true;
      this.modalForm?.patchValue(this.model);
    } else {
      this.isEditMode = false;
      this.modalForm?.reset();
    }
  }

  initModalForm(): void {
    this.modalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      address: ['', Validators.required],
      primaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhoneNumber: ['', [Validators.pattern(/^\d{10}$/)]]
    });
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
      this.editEntity();
    }
    else {
      this.addEntity();
    }
  }

  editEntity(): void {
    this.isSubmitting = true;
    let newModel: UpdateCustomerRequest = {
      id: this.model?.id,
      ...this.modalForm.value
    };
    if (this.model?.id) {
      this.service.updateCustomer(this.model.id, newModel).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.modalForm.reset();
          this.closeModalProgramatically();
          if (this.successAction != null)
            this.successAction.emit({ ...response });
        },
        error: (err) => {
          this.isSubmitting = false;
          let errorMessage = err?.error?.message || 'Error occured while updating customer details';
          this.closeModalProgramatically();
          if (this.errorAction != null)
            this.errorAction.emit(errorMessage);
        }
      });
    }
  }

  addEntity(): void {
    this.isSubmitting = true;
    let newModel: CreateCustomerRequest = {
      ...this.modalForm.value
    };
    this.service.createCustomer(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while adding customer';
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
