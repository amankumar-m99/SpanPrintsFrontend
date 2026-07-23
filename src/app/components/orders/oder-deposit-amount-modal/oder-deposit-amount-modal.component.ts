import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';
import { OrderDepositAmountRequest } from '../../../model/order/order-deposit-amount-request.model';

@Component({
  selector: 'app-oder-deposit-amount-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './oder-deposit-amount-modal.component.html',
  styleUrl: './oder-deposit-amount-modal.component.css'
})

export class OderDepositAmountModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;

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
      this.modalForm?.patchValue({ 'note': this.model.note });
    } else {
      this.modalForm?.reset();
    }
  }

  initModalForm(): void {
    this.modalForm = this.fb.group({
      depositAmount: ['', [Validators.required, Validators.min(1)]],
    });
  }

  get depositAmount() { return this.modalForm.get('depositAmount'); }

  incrementAmount() {
    const currentCount = this.depositAmount?.value || 0;
    this.modalForm.patchValue({ depositAmount: currentCount + 1 }, { emitEvent: false });
  }

  decrementAmount() {
    const currentCount = this.depositAmount?.value || 0;
    if (currentCount > 1) {
      this.modalForm.patchValue({ depositAmount: currentCount - 1 }, { emitEvent: false });
    }
  }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#depositOrderAmountModalFormSubmitButton') as HTMLElement)?.click();
  }

  submitForm(): void {
    if (this.modalForm.invalid) {
      this.modalForm.markAllAsTouched();
      return;
    }

    if (this.model) {
      this.isSubmitting = true;
      let newModel: OrderDepositAmountRequest = {
        uuid: this.model.uuid,
        depositAmount: this.depositAmount?.value
      }

      this.service.depositAmount(newModel).subscribe({
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
    (document.querySelector('#depositOrderAmountModalCloseBtn') as HTMLElement)?.click();
  }
}
