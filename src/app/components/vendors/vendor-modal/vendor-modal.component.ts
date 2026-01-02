import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Vendor } from '../../../model/vendor.model';
import { VendorService } from '../../../services/vendor/vendor.service';

@Component({
  selector: 'app-vendor-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendor-modal.component.html',
  styleUrl: './vendor-modal.component.css'
})
export class VendorModalComponent implements OnInit, OnChanges {

  vendorForm!: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @ViewChild('vendorModalCloseBtn') vendorModalCloseBtn!: ElementRef;
  @Input() vendor: Vendor | null = null;
  @Output() successAction = new EventEmitter<Vendor>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private vendorService: VendorService) { }

  ngOnInit(): void {
    this.vendorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      primaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhoneNumber: ['', [Validators.pattern(/^\d{10}$/)]],
      address: ['']
    });
  }

  get name() { return this.vendorForm.get('name'); }
  get email() { return this.vendorForm.get('email'); }
  get primaryPhoneNumber() { return this.vendorForm.get('primaryPhoneNumber'); }
  get alternatePhoneNumber() { return this.vendorForm.get('alternatePhoneNumber'); }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.vendor != null) {
      this.isEditMode = true;
      this.vendorForm.patchValue(this.vendor);
    } else {
      this.isEditMode = false;
    }
  }

  submitForm(): void {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.editVendor();
    }
    else {
      this.addVendor();
    }
  }

  addVendor(): void {
    this.isSubmitting = true;
    let newVendor: Vendor = {
      uuid: crypto.randomUUID(),
      createdAt: new Date(),
      ...this.vendorForm.value
    };
    this.vendorService.createVendor(newVendor).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.vendorForm.reset();
        this.vendorModalCloseBtn.nativeElement.click();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        console.log(errorMessage);
        this.vendorModalCloseBtn.nativeElement.click();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  editVendor(): void {
    this.isSubmitting = true;
    let newVendor: Vendor = {
      uuid: this.vendor?.uuid,
      createdAt: new Date(),
      ...this.vendorForm.value
    };
    this.vendorService.updateVendor(newVendor).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.vendorForm.reset();
        this.vendorModalCloseBtn.nativeElement.click();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        this.vendorModalCloseBtn.nativeElement.click();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }
}
