import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vendor } from '../../model/vendor.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.css'
})
export class VendorsComponent {

  vendorForm!: FormGroup;
  vendors: Vendor[] = [];
  editingVendor: Vendor | null = null;

  constructor(private fb: FormBuilder,
    private router: Router) { }

  ngOnInit() {
    this.vendorForm = this.fb.group({
      vendorName: ['', Validators.required],
      email: ['', Validators.email],
      primaryPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      alternatePhone: [''],
      address: ['']
    });
  }

  saveVendor() {
    if (this.vendorForm.invalid) return;

    if (this.editingVendor) {
      Object.assign(this.editingVendor, this.vendorForm.value);
      this.editingVendor = null;
    } else {
      this.vendors.unshift({
        uuid: crypto.randomUUID(),
        dbid: Date.now(),
        createdAt: new Date(),
        ...this.vendorForm.value
      });
    }
    this.vendorForm.reset();
  }

  editVendor(vendor: Vendor) {
    this.vendorForm.patchValue(vendor);
    this.editingVendor = vendor;
  }

  deleteVendor(vendor: Vendor) {
    if (!confirm(`Delete vendor ${vendor.vendorName}?`)) return;
    this.vendors = this.vendors.filter(v => v.uuid !== vendor.uuid);
  }

  openVendorProfile(vendor: Vendor) {
    this.router.navigate(['/vendors', vendor.uuid]);
  }


}
