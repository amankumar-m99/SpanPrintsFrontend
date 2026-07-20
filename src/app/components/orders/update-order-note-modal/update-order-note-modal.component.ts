import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UpdateCustomerRequest } from '../../../model/customer/update-customer-request.model';
import { CreateCustomerRequest } from '../../../model/customer/create-customer-request.model';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';

@Component({
  selector: 'app-update-order-note-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './update-order-note-modal.component.html',
  styleUrl: './update-order-note-modal.component.css'
})

export class UpdateOrderNoteModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: Order | undefined | null;
  @Output() successAction = new EventEmitter<Order>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: OrderService) { }

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
      this.modalForm?.patchValue({ 'note': this.model.note });
    } else {
      this.isEditMode = false;
      this.modalForm?.reset();
    }
  }

  initModalForm(): void {
    this.modalForm = this.fb.group({
      note: ['', Validators.required]
    });
  }

  get note() { return this.modalForm.get('note'); }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#updateNoteModalFormSubmitButton') as HTMLElement)?.click();
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
      ...this.modalForm.value
    };
    /*
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
        */
  }

  addEntity(): void {
    this.isSubmitting = true;
    let newModel: CreateCustomerRequest = {
      ...this.modalForm.value
    };
    /*
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
    */
  }

  closeModalProgramatically(): void {
    (document.querySelector('#customerModalCloseBtn') as HTMLElement)?.click();
  }
}
