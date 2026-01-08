import { Component, ElementRef, ViewChild } from '@angular/core';
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
  tempVendor !: Vendor | null;
  isSubmitting = false;
  isRefreshingData = false;
  showToast = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';

  @ViewChild('launchVendorModalButton') launchVendorModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteVendorButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllVendordsButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private router: Router,
    private vendorService: VendorService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.vendorService.getAllVendors().subscribe({
      next: (res) => {
        this.vendors = res;
        if (this.isRefreshingData) {
          this.setToast("success", "Vendots data refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.setToast("error", err?.error?.message || 'Error loading vendors');
        this.isRefreshingData = false;
      },
    });
  }

  refreshData(): void {
    this.isRefreshingData = true;
    this.loadData();
  }

  addVendor(): void {
    this.tempVendor = null;
    this.launchVendorModal();
  }

  editVendor(vendor: Vendor) {
    this.tempVendor = vendor;
    this.launchVendorModal();
  }

  askDeleteVendor(vendor: Vendor) {
    this.deleteMsg = `Delete vendor ${vendor.name}?`;
    this.tempVendor = vendor;
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  deleteVendor() {
    if (this.tempVendor) {
      this.vendorService.deleteVendorByUuid(this.tempVendor.uuid).subscribe({
        next: () => {
          this.vendors = this.vendors.filter(c => c.uuid !== this.tempVendor?.uuid);
          this.setToast("warning", "Vendor deleted");
        },
        error: (err) => {
          this.setToast("error", err?.error?.message || 'Error occured while deleting vendor');
        },
      });
    }
  }

  askDeleteAllVendors() {
    this.deleteMsg = 'Delete all vendors?';
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  deleteAllVendors(): void {
    this.vendorService.deleteAllVendors().subscribe({
      next: () => {
        this.vendors = [];
        this.setToast("warning", "All vendors deleted");
      },
      error: (err) => {
        this.setToast("error", err?.error?.message || 'Error deleting vendors');
      },
    });
  }

  successAction(vendor: Vendor): void {
    if (this.tempVendor) {
      let index = this.vendors.findIndex(c => c.id === this.tempVendor?.id);
      if (index !== -1) {
        this.vendors[index] = { ...this.tempVendor };
      }
      this.toastMsg = "Vendor updated.";
    }
    else {
      this.vendors.push(vendor);
      this.toastMsg = "Vendor added.";
    }
    this.toastType = "success";
    this.showToast = true;
  }

  errorAction(errorStr: string): void {
    this.setToast("error", errorStr);
  }

  launchVendorModal(): void {
    this.launchVendorModalButton.nativeElement.click();
  }

  setToast(type: string, msg: string): void {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
  }

  toastCloseAction(): void {
    this.showToast = false
  }

  openDetails(vendor: Vendor) {
    this.router.navigate(['/dashboard/vendor', vendor.uuid]);
  }

}
