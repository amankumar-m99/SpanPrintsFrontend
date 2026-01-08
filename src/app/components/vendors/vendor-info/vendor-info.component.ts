import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../utility/toast/toast.component";
import { VendorModalComponent } from '../vendor-modal/vendor-modal.component';
import { VendorService } from '../../../services/vendor/vendor.service';
import { Vendor } from '../../../model/vendor/vendor.model';
import { Constant } from '../../../constant/Constant';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../utility/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-vendor-info',
  imports: [CommonModule, FormsModule, RouterLink, ToastComponent, ConfirmDialogComponent, VendorModalComponent],
  standalone: true,
  templateUrl: './vendor-info.component.html',
  styleUrl: './vendor-info.component.css'
})
export class VendorInfoComponent implements OnInit {

  vendorUuid !: string;
  vendor !: Vendor | null;
  errorMsg = '';
  copied = false;
  showToast = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';

  enteredUuid = '';
  isUuidValid = false;
  private uuidRegex: RegExp = Constant.UUID_REGEX;

  constructor(private router: Router, private route: ActivatedRoute, private vendorService: VendorService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.vendorUuid = uuid;
        this.fetchVendorDetails(uuid);
      }
    });
  }

  copyUuid() {
    if (this.vendor?.uuid) {
      navigator.clipboard.writeText(this.vendor.uuid).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1500);
      });
    }
  }

  fetchVendorDetails(uuid: string) {
    this.vendorService.getVendorByUuid(this.vendorUuid).subscribe({
      next: (res) => {
        this.vendor = res;
        console.log(this.vendor);
        this.errorMsg = '';
        this.deleteMsg = `Delete vendor ${this.vendor.name}?`;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load vendor's data!";
      }
    });
  }

  deleteVendor() {
    if (this.vendor) {
      this.vendorService.deleteVendorByUuid(this.vendor.uuid).subscribe({
        next: () => {
          this.vendor = null;
          this.setToast("warning", "Vendor deleted");
          this.router.navigate(['/dashboard/vendors']);
        },
        error: (err) => {
          this.setToast("error", err?.error?.message || 'Error occured while deleting vendor');
        },
      });
    }
  }
  setToast(type: string, msg: string): void {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
  }

  vendorSuccess(vendor: Vendor): void {
    this.toastMsg = "Vendor updated.";
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

  reload() {
    window.location.reload();
  }

  validateUuid() {
    this.isUuidValid = this.uuidRegex.test(this.enteredUuid.trim());
  }

  navigateWithUuid() {
    if (!this.isUuidValid) return;
    this.router.navigate(['/dashboard/vendor', this.enteredUuid.trim()]);
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.enteredUuid = text.trim();
      this.validateUuid();
    } catch {
      alert('Clipboard access denied');
    }
  }
}
