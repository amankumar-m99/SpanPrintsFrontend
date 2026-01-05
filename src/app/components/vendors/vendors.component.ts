import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Vendor } from '../../model/vendor/vendor.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VendorModalComponent } from "./vendor-modal/vendor-modal.component";
import { ToastComponent } from '../utility/toast/toast.component';
import { VendorService } from '../../services/vendor/vendor.service';
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, VendorModalComponent, ToastComponent, ConfirmDialogComponent],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.css'
})
export class VendorsComponent {
  vendors: Vendor[] = [];
  isSubmitting = false;
  editingVendor!: Vendor | null;
  showToast = false;
  toastType = 'info';
  toastMsg = '';
  deleteVendorMsg = '';
  deleteAllVendorsMsg = '';
  toBeDeletedVendor !: Vendor | null;
  isRefreshTableData = false;

  @ViewChild('launchVendorModalButton') launchVendorModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteVendorButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllVendordsButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private router: Router,
    private vendorService: VendorService) { }

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors() {
    this.vendorService.getAllVendors().subscribe({
      next: (res) => {
        this.vendors = res;
        if (this.isRefreshTableData) {
          this.toastType = "success";
          this.toastMsg = "Vendors data refreshed.";
          this.showToast = true;
          this.isRefreshTableData = false;
        }
      },
      error: (err) => {
        this.toastType = "error";
        this.toastMsg = err?.error?.message || 'Error loading vendors';
        this.showToast = true;
        this.isRefreshTableData = false;
      }
    });
  }

  refreshTable(): void {
    this.isRefreshTableData = true;
    this.loadVendors();
  }

  addVendor(): void {
    this.editingVendor = null;
    this.launchVendorModalButton.nativeElement.click();
  }

  editVendor(vendor: Vendor) {
    this.editingVendor = vendor;
    this.launchVendorModalButton.nativeElement.click();
  }

  askDeleteVendor(vendor: Vendor) {
    this.deleteVendorMsg = `Delete vendor ${vendor.name}?`;
    this.toBeDeletedVendor = vendor;
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  deleteVendor() {
    if (this.toBeDeletedVendor) {
      this.vendorService.deleteVendorByUuid(this.toBeDeletedVendor.uuid).subscribe({
        next: () => {
          this.vendors = this.vendors.filter(c => c.uuid !== this.toBeDeletedVendor?.uuid);
          this.toastType = "warning";
          this.toastMsg = "Vendor deleted";
          this.showToast = true;
        },
        error: (err) => {
          this.toastType = "error";
          this.toastMsg = err?.error?.message || 'Error deleting vendor';
          this.showToast = true;
        },
      });
    }
  }

  askDeleteAllVendors() {
    this.deleteAllVendorsMsg = 'Delete all vendors';
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  deleteAllVendors(): void {
    this.vendorService.deleteAllVendors().subscribe({
      next: () => {
        this.vendors = [];
        this.toastType = "warning";
        this.toastMsg = "All Vendors deleted";
        this.showToast = true;
      },
      error: (err) => {
        this.toastType = "error";
        this.toastMsg = err?.error?.message || 'Error deleting vendors';
        this.showToast = true;
      },
    });
  }

  vendorSuccess(vendor: Vendor): void {
    if (this.editingVendor) {
      this.editingVendor.email = vendor.email;
      this.editingVendor.name = vendor.name
      this.editingVendor.primaryPhoneNumber = vendor.primaryPhoneNumber;
      this.editingVendor.alternatePhoneNumber = vendor.alternatePhoneNumber;
      this.toastMsg = "Vendor updated.";
    }
    else {
      this.vendors.push(vendor);
      this.toastMsg = "Vendor added.";
    }
    this.toastType = "success";
    this.showToast = true;
  }

  vendorError(errorStr: string): void {
    this.toastMsg = errorStr;
    this.toastType = "error";
    this.showToast = true;
  }

  toastCloseAction(): void {
    this.showToast = false
  }

  openVendorProfile(vendor: Vendor) {
    this.router.navigate(['/dashboard/vendor', vendor.uuid]);
  }
}
