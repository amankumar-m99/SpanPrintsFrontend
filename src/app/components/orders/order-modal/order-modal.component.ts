import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-modal.component.html',
  styleUrl: './order-modal.component.css'
})
export class OrderModalComponent implements OnInit, OnChanges {

  modalForm!: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;
  selectedFiles: File[] = [];
  jobTypes: string[] = [
    'BANNER',
    'RECEIT',
    'VISITING_CARD',
    'WEDDING_CARD',
    'COLOR_POSTER',
    'BOOK_BINDING',
    'PAMPLET',
    'BILL_BOOK'
  ];

  @Input() model: Order | null = null;
  @Output() successAction = new EventEmitter<Order>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: OrderService) { }

  ngOnInit(): void {
    this.modalForm = this.fb.group({
      customerName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      jobType: ['', Validators.required],
      count: [1, [Validators.required, Validators.min(1)]],
      dateOfDelivery: ['', [Validators.required, Validators.min(1)]],
      bookNumber: [1, [Validators.required, Validators.min(1)]],
      wBookNumber: [1, [Validators.required, Validators.min(1)]],
      remainingAmount: ['', Validators.required],
      totalAmount: ['', Validators.required],
      depositAmount: ['', Validators.required],
      discountedAmount: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      note: [''],
      description: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.model != null) {
      this.isEditMode = true;
      this.modalForm.patchValue(this.model);
    } else {
      this.isEditMode = false;
      this.modalForm.reset();
    }
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);
    event.target.value = ''; // reset input
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
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

  addEntity(): void {
    this.isSubmitting = true;
    const formData = new FormData();
    Object.entries(this.modalForm.value).forEach(([key, value]) => formData.append(key, value as string));
    this.selectedFiles.forEach(file => formData.append('attachments', file));
    this.service.createOrder(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  editEntity(): void {
    this.isSubmitting = true;
    let newEntity: Order = {
      uuid: this.model?.uuid,
      id: this.model?.id,
      createdAt: new Date(),
      ...this.modalForm.value
    };
    this.service.updateOrder(newEntity).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#orderModalCloseBtn') as HTMLElement)?.click();
  }

  get name() { return this.modalForm.get('name'); }
  get primaryPhoneNumber() { return this.modalForm.get('primaryPhoneNumber'); }
  get alternatePhoneNumber() { return this.modalForm.get('alternatePhoneNumber'); }
  get email() { return this.modalForm.get('email'); }
}
