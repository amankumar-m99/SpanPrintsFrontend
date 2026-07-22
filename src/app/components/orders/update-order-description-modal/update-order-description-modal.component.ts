
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';
import { UpdateOrderNonDependentFieldsRequest } from '../../../model/order/update-order-non-dependent-fields.model';

@Component({
  selector: 'app-update-order-description-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './update-order-description-modal.component.html',
  styleUrl: './update-order-description-modal.component.css'
})

export class UpdateOrderDescriptionModalComponent implements OnInit, OnChanges {

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
      if (this.model.description)
        this.isEditMode = true;
      else
        this.isEditMode = false;
      this.modalForm?.patchValue({ 'description': this.model.description });
    } else {
      this.isEditMode = false;
      this.modalForm?.reset();
    }
  }

  initModalForm(): void {
    this.modalForm = this.fb.group({
      description: ['', Validators.required]
    });
  }

  get description() { return this.modalForm.get('description'); }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#updateOrderDescriptionModalFormSubmitButton') as HTMLElement)?.click();
  }

  submitForm(): void {
    if (this.modalForm.invalid) {
      this.modalForm.markAllAsTouched();
      return;
    }

    if (this.model) {
      this.isSubmitting = true;
      let newModel: UpdateOrderNonDependentFieldsRequest = {
        uuid: this.model.uuid,
        printJobTypeId: this.model.printJobTypeId,
        quantity: this.model.quantity,
        bookNumber: this.model.bookNumber,
        dateOfPlaced: this.model.dateOfPlaced,
        dateOfDelivery: this.model.dateOfDelivery,
        totalAmount: this.model.totalAmount,
        discountedAmount: this.model.discountedAmount,
        note: this.model.note,
        description: this.description?.value,
        printJobStatus: this.model.printJobStatus
      }

      this.service.updateOrderNonDependentFields(newModel).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.modalForm.reset();
          this.closeModalProgramatically();
          if (this.successAction != null)
            this.successAction.emit({ ...response });
        },
        error: (err) => {
          this.isSubmitting = false;
          let errorMessage = err?.error?.message || 'Error occured while updating';
          this.closeModalProgramatically();
          if (this.errorAction != null)
            this.errorAction.emit(errorMessage);
        }
      });
    }

  }

  closeModalProgramatically(): void {
    (document.querySelector('#updateOrderDescriptionModalCloseBtn') as HTMLElement)?.click();
  }
}
