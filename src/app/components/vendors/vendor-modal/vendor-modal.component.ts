import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Vendor } from '../../../model/vendor/vendor.model';
import { VendorService } from '../../../services/vendor/vendor.service';
import { RequiredFieldMarkerComponent } from '../../utility/required-field-marker/required-field-marker.component';
import { UpdateVendorRequest } from '../../../model/vendor/update-vendor-request.model';
import { CreateVendorRequest } from '../../../model/vendor/create-vendor-request.model';

@Component({
  selector: 'app-vendor-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RequiredFieldMarkerComponent],
  templateUrl: './vendor-modal.component.html',
  styleUrl: './vendor-modal.component.css'
})
export class VendorModalComponent implements OnInit, OnChanges {

  modalForm!: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: UpdateVendorRequest | null = null;
  @Output() successAction = new EventEmitter<Vendor>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: VendorService) { }

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
      email: ['', Validators.email],
      address: [''],
      primaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhoneNumber: ['', [Validators.pattern(/^\d{10}$/)]],
    });
  }

  get name() { return this.modalForm.get('name'); }
  get email() { return this.modalForm.get('email'); }
  get address() { return this.modalForm.get('address'); }
  get primaryPhoneNumber() { return this.modalForm.get('primaryPhoneNumber'); }
  get alternatePhoneNumber() { return this.modalForm.get('alternatePhoneNumber'); }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#vendorModalFormSubmitButton') as HTMLElement)?.click();
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
    let newModel: UpdateVendorRequest = {
      id: this.model?.id,
      ...this.modalForm.value
    };
    this.service.updateVendor(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while updating vendor details';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  addEntity(): void {
    this.isSubmitting = true;
    let newModel: CreateVendorRequest = {
      ...this.modalForm.value
    };
    this.service.createVendor(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while adding vendor';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#vendorModalCloseBtn') as HTMLElement)?.click();
  }
}
