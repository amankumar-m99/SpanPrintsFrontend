import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';
import { UpdateOrderNonDependentFieldsRequest } from '../../../model/order/update-order-non-dependent-fields.model';

@Component({
  selector: 'app-upload-order-attachment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './upload-order-attachment-modal.component.html',
  styleUrl: './upload-order-attachment-modal.component.css'
})

export class UploadOrderAttachmentModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;

  selectedFiles: File[] = [];

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
      this.modalForm?.patchValue({ 'description': this.model.description });
    } else {
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
    (document.querySelector('#uploadOrderAttachmentModalFormSubmitButton') as HTMLElement)?.click();
  }

  submitForm(): void {
    if (this.modalForm.invalid) {
      this.modalForm.markAllAsTouched();
      return;
    }

    if (this.model) {
      this.isSubmitting = true;
      const formData = new FormData();
      this.selectedFiles.forEach(file =>
        formData.append('attachments', file)
      );
      this.service.addOrderAttachment(this.model.uuid, formData).subscribe({
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
    (document.querySelector('#uploadOrderAttachmentModalCloseBtn') as HTMLElement)?.click();
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }
}
