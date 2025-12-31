import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer/customer.service';
import { Customer } from '../../../model/customer.model';
import { CommonModule } from '@angular/common';
import { CustomerModalComponent } from "../customer-modal/customer-modal.component";
import { ToastComponent } from "../../utility/toast/toast.component";

@Component({
  selector: 'app-customer-info',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomerModalComponent, ToastComponent],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.css'
})
export class CustomerInfoComponent implements OnInit {

  customerUuid!: string;
  customer!: Customer;
  errorMsg = '';
  copied = false;
  showToast = false;
  toastType = 'info';
  toastMsg = '';

  constructor(private route: ActivatedRoute, private customerService: CustomerService) { }

  // ngOnInit(): void {
  //   this.customerUuid = this.route.snapshot.paramMap.get('uuid')!;
  //   this.fetchCustomerDetails(this.customerUuid);
  // }

  // Recommended (reactive approach – better)
  // If the same component can be reused with different UUIDs without reload
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.customerUuid = uuid;
        this.fetchCustomerDetails(uuid);
      }
    });
  }

  copyUuid() {
    navigator.clipboard.writeText(this.customer.uuid).then(() => {
      this.copied = true;

      setTimeout(() => {
        this.copied = false;
      }, 1500);
    });
  }

  fetchCustomerDetails(uuid: string) {
    // call backend API here
    console.log("lkdsngkldsfnn");
    console.log(this.customerUuid);
    this.customerService.getCustomerByUuid(this.customerUuid).subscribe({
      next: (res) => {
        this.customer = res;
        console.log(this.customer);
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load customer's data!";
      }
    });
  }

  customerSuccess(customer: Customer): void {
    this.toastMsg = "Customer updated.";
    this.toastType = "success";
    this.showToast = true;
  }

  customerError(errorStr: string): void {
    this.toastMsg = errorStr;
    this.toastType = "error";
    this.showToast = true;
  }

  toastCloseAction(): void {
    this.showToast = false
  }
}
