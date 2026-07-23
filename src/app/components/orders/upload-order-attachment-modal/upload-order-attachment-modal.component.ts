import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';
import { FileSizePipe } from "../../../pipes/file-size/file-size.pipe";

@Component({
  selector: 'app-upload-order-attachment-modal',
  standalone: true,
  imports: [CommonModule, FileSizePipe],
  templateUrl: './upload-order-attachment-modal.component.html',
  styleUrl: './upload-order-attachment-modal.component.css'
})

export class UploadOrderAttachmentModalComponent {

  isSubmitting = false;
  showToast = false;

  selectedFiles: File[] = [];

  @Input() model: Order | undefined | null;
  @Output() successAction = new EventEmitter<Order>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private service: OrderService) { }

  submitForm(): void {
    if (this.model) {
      this.isSubmitting = true;
      const formData = new FormData();
      this.selectedFiles.forEach(file =>
        formData.append('attachments', file)
      );
      this.service.addOrderAttachment(this.model.uuid, formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
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
