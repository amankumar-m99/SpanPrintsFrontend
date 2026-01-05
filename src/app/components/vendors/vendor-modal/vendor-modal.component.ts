import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Vendor } from '../../../model/vendor/vendor.model';
import { VendorService } from '../../../services/vendor/vendor.service';

@Component({
  selector: 'app-vendor-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendor-modal.component.html',
  styleUrl: './vendor-modal.component.css'
})
export class VendorModalComponent implements OnInit, OnChanges {

  modalForm!: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: Vendor | null = null;
  @Output() successAction = new EventEmitter<Vendor>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: VendorService) { }

  ngOnInit(): void {
    this.modalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      primaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhoneNumber: ['', [Validators.pattern(/^\d{10}$/)]],
      address: ['']
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
    let newModel: Vendor = {
      uuid: crypto.randomUUID(),
      createdAt: new Date(),
      ...this.modalForm.value
    };
    this.service.createVendor(newModel).subscribe({
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
        console.log(errorMessage);
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  editEntity(): void {
    this.isSubmitting = true;
    let newModel: Vendor = {
      uuid: this.model?.uuid,
      createdAt: new Date(),
      ...this.modalForm.value
    };
    this.service.updateVendor(newModel).subscribe({
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
    (document.querySelector('#vendorModalCloseBtn') as HTMLElement)?.click();
  }

  get name() { return this.modalForm.get('name'); }
  get email() { return this.modalForm.get('email'); }
  get primaryPhoneNumber() { return this.modalForm.get('primaryPhoneNumber'); }
  get alternatePhoneNumber() { return this.modalForm.get('alternatePhoneNumber'); }
}
