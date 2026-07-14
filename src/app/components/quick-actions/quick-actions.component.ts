import { Component, OnInit } from '@angular/core';
import { CustomerModalComponent } from "../customers/customer-modal/customer-modal.component";
import { ToastComponent } from "../utility/toast/toast.component";
import { CommonModule } from '@angular/common';
import { VendorModalComponent } from "../vendors/vendor-modal/vendor-modal.component";
import { OrderModalComponent } from "../orders/order-modal/order-modal.component";
import { ExpenseModalComponent } from "../expenses/expense-modal/expense-modal.component";
import { PrintjobtypeModalComponent } from "../printjob/printjobtype-modal/printjobtype-modal.component";
import { InventoryItemModalComponent } from "../inventory/inventory-item-modal/inventory-item-modal.component";
import { RouterLink } from "@angular/router";
import { OrderService } from '../../services/order/order.service';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CustomerModalComponent, ToastComponent, CommonModule, VendorModalComponent, OrderModalComponent, ExpenseModalComponent, PrintjobtypeModalComponent, InventoryItemModalComponent, RouterLink],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent implements OnInit {

  numberOfOrdersPlacedToday = 0;
  numberOfOrdersPrepared = 0;
  numberOfOrdersToBePrepared = 0;
  numberOfOrdersDelivered = 0;
  numberOfOrdersToBeDelivered = 0;
  numberOfOrdersYetToDeliver = 0;
  showToast = false;
  toastType = 'info';
  toastMsg = '';

  constructor(private orderService: OrderService) { }
  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.orderService.getAllOrdersPlacedToday().subscribe({
      next: (res) => {
        this.numberOfOrdersPlacedToday = res.length;
      },
      error: (err) => {
        this.numberOfOrdersPlacedToday = 0;
      },
    });
    this.orderService.getAllOrdersToBePreparedToday().subscribe({
      next: (res) => {
        this.numberOfOrdersToBePrepared = res.length;
        this.numberOfOrdersPrepared = 0;
        for (let order of res) {
          this.numberOfOrdersPrepared += (order.printJobStatus === 'PREPARED') ? 1 : 0;
        }
      },
      error: (err) => {
        this.numberOfOrdersToBePrepared = 0;
      },
    });
    this.orderService.getAllOrdersToBeDeliveredToday().subscribe({
      next: (res) => {
        this.numberOfOrdersToBeDelivered = res.length;
        this.numberOfOrdersDelivered = 0;
        for (let order of res) {
          this.numberOfOrdersDelivered += (order.printJobStatus === 'DELIVERED') ? 1 : 0;
        }
      },
      error: (err) => {
        this.numberOfOrdersDelivered = 0;
      },
    });
    this.orderService.getAllOrdersYetToDeliver().subscribe({
      next: (res) => {
        this.numberOfOrdersYetToDeliver = res.length;
      },
      error: (err) => {
        this.numberOfOrdersYetToDeliver = 0;
      },
    });
  }

  showSuccessToastModal(msg: string): void {
    this.toastType = "success";
    this.toastMsg = msg;
    this.showToast = true;
  }

  showErrorToastModal(errorStr: string): void {
    this.toastType = "error";
    this.toastMsg = errorStr;
    this.showToast = true;
  }

  hideToastModal(): void {
    this.showToast = false
  }
}
