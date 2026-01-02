import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../utility/toast/toast.component";
import { VendorModalComponent } from '../vendor-modal/vendor-modal.component';
import { VendorService } from '../../../services/vendor/vendor.service';
import { Vendor } from '../../../model/vendor.model';

@Component({
  selector: 'app-vendor-info',
  imports: [CommonModule, RouterLink, VendorModalComponent, ToastComponent],
  standalone: true,
  templateUrl: './vendor-info.component.html',
  styleUrl: './vendor-info.component.css'
})
export class VendorInfoComponent implements OnInit {

  vendorUuid!: string;
  vendor !: Vendor;
  errorMsg = '';
  copied = false;
  showToast = false;
  toastType = 'info';
  toastMsg = '';

  constructor(private route: ActivatedRoute, private vendorService: VendorService) { }

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
    navigator.clipboard.writeText(this.vendor.uuid).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 1500);
    });
  }

  fetchVendorDetails(uuid: string) {
    this.vendorService.getVendorByUuid(this.vendorUuid).subscribe({
      next: (res) => {
        this.vendor = res;
        console.log(this.vendor);
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load vendor's data!";
      }
    });
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
}
