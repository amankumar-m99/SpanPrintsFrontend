import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { OrderCardComponent } from './order-card/order-card.component';
import { Order } from '../../model/order/order.model';
import { OrderService } from '../../services/order/order.service';
import { OrderModalComponent } from "./order-modal/order-modal.component";
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";
import { Router } from '@angular/router';
import { ToastComponent } from "../utility/toast/toast.component";

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, OrderCardComponent, FormsModule, OrderModalComponent, ConfirmDialogComponent, ToastComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})

export class OrdersComponent implements OnInit {

  orders: Order[] = [];
  tempOrder !: Order | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;

  filteredOrders: any[] = [];   // filtered & sorted list
  filterStatus: string = '';    // holds dropdown value
  sortBy: string = 'createdAt_desc';
  searchTerm: string = '';
  activeFiltersCount = 0;
  activeFiltersSummary = '';

  @ViewChild('launchOrderModalButton') launchOrderModalButton !: ElementRef;
  @ViewChild('launchConfirmDeleteOrderButton') launchConfirmDeleteButton !: ElementRef;
  @ViewChild('launchConfirmDeleteAllOrdersButton') launchConfirmDeleteAllButton !: ElementRef;

  constructor(private fb: FormBuilder, private router: Router, private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.orders = res;
        if (this.isRefreshingData) {
          this.showToastComponent("success", "Customers data refreshed.");
          this.isRefreshingData = false;
        }
        this.applyFilters();
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading customers');
        this.isRefreshingData = false;
      },
    });
  }

  refreshTable(): void {
    this.isRefreshingData = true;
    this.loadData();
  }

  applyFilters() {
    let data = [...this.orders];
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term)
      );
    }
    // Status filter
    if (this.filterStatus) {
      data = data.filter(o => o.paymentStatus === this.filterStatus);
    }
    //  Sorting
    switch (this.sortBy) {
      case 'createdAt_desc':
        data.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case 'createdAt_asc':
        data.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case 'amount_desc':
        data.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case 'amount_asc':
        data.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
    }
    this.activeFiltersCount = 0;
    let summaries: string[] = [];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.activeFiltersCount++;
      summaries.push(`Search: "${this.searchTerm}"`);
    }

    if (this.filterStatus && this.filterStatus !== '') {
      this.activeFiltersCount++;
      summaries.push(`Status: ${this.filterStatus}`);
    }

    if (this.sortBy && this.sortBy !== 'createdAt_desc') {
      this.activeFiltersCount++;
      let label = '';
      switch (this.sortBy) {
        case 'createdAt_asc': label = 'Oldest First'; break;
        case 'amount_desc': label = 'Amount High→Low'; break;
        case 'amount_asc': label = 'Amount Low→High'; break;
      }
      summaries.push(`Sort: ${label}`);
    }

    this.activeFiltersSummary = summaries.join(', ');
    this.filteredOrders = data;
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = '';
    this.sortBy = 'createdAt_desc';
    this.applyFilters(); // reset filters count
  }


  addOrder(): void {
    this.tempOrder = null;
    this.launchOrderModal();
  }

  editOrder(order: Order) {
    this.tempOrder = order;
    this.launchOrderModal();
  }

  askDeleteOrder(order: Order) {
    this.deleteMsg = `Delete order ${order.uuid}?`;
    this.tempOrder = order;
    this.launchConfirmDeleteModal();
  }

  deleteOrder() {
    if (this.tempOrder) {
      this.orderService.deleteOrderByUuid(this.tempOrder.uuid).subscribe({
        next: () => {
          this.orders = this.orders.filter(c => c.uuid !== this.tempOrder?.uuid);
          this.showToastComponent("warning", "Customer deleted");
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting customer');
        },
      });
    }
  }

  askDeleteAllOrders(): void {
    this.deleteMsg = 'Delete all orders?';
    this.launchConfirmDeleteModal();
  }

  deleteAllOrders(): void {
    this.orderService.deleteAllOrders().subscribe({
      next: () => {
        this.orders = [];
        this.showToastComponent("warning", "All orders deleted");
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error deleting orders');
      },
    });
  }

  successAction(order: Order): void {
    if (this.tempOrder) {
      let index = this.orders.findIndex(c => c.id === this.tempOrder?.id);
      if (index !== -1) {
        this.orders[index] = { ...this.tempOrder };
      }
      this.toastMsg = "Order updated.";
    }
    else {
      this.orders.push(order);
      this.toastMsg = "Order added.";
    }
    this.showToastComponent("success", this.toastMsg);
  }

  errorAction(errorStr: string): void {
    this.showToastComponent("error", errorStr);
  }

  launchOrderModal(): void {
    this.launchOrderModalButton.nativeElement.click();
  }

  launchConfirmDeleteModal(): void {
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  launchConfirmDeleteAllModal(): void {
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }

  openDetails(order: Order) {
    this.router.navigate(['/dashboard/customer', order.uuid]);
  }
}
