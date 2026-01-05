import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { OrderCardComponent } from './order-card/order-card.component';
import { Order } from '../../model/order.model';
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
  orders: Order[] = [];           // original list from backend
  orderForm!: FormGroup;
  isSubmitting = false;
  editIndex: number | null = null; // Track editing order index
  filteredOrders: any[] = [];   // filtered & sorted list
  filterStatus: string = '';    // holds dropdown value
  sortBy: string = 'createdAt_desc';
  searchTerm: string = '';
  activeFiltersCount = 0;
  activeFiltersSummary = '';
  selectedFiles: File[] = [];
  deleteAllOrdersMsg = '';
  showToast = false;
  toastType = 'info';
  toastMsg = '';
  isRefreshTableData = false;
  editingOrder !: Order | null;
  toBeDeletedOrder !: Order | null;
  deleteOrderMsg = '';

  @ViewChild('launchOrderModalButton') launchOrderModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteOrderButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllOrdersButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private fb: FormBuilder, private router: Router, private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.orders = res;
        if (this.isRefreshTableData) {
          this.toastType = "success";
          this.toastMsg = "Orders data refreshed.";
          this.showToast = true;
          this.isRefreshTableData = false;
        }
      },
      error: (err) => {
        if (this.isRefreshTableData) {
          this.toastType = "error";
          this.toastMsg = err?.error?.message || 'Error loading orders';
          this.showToast = true;
          this.isRefreshTableData = false;
        }
      }
    });
    this.applyFilters();
  }

  refreshTable(): void {
    this.isRefreshTableData = true;
    this.loadOrders();
  }

  applyFilters() {
    let data = [...this.orders];

    // 🔍 Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.customerName.toLowerCase().includes(term) ||
        o.phone.includes(term)
      );
    }

    // 📌 Status filter
    if (this.filterStatus) {
      data = data.filter(o => o.paymentStatus === this.filterStatus);
    }

    // ↕ Sorting
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

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);
    event.target.value = ''; // reset input
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  addOrder(): void {
    this.editingOrder = null;
    this.launchOrderModalButton.nativeElement.click();
  }

  editOrder(order: Order) {
    this.editingOrder = order;
    this.launchOrderModalButton.nativeElement.click();
  }

  // editOrder(order: any, index: number) {
  //   this.editIndex = index;
  //   this.orderForm.patchValue(order);
  //   const modal = document.getElementById('newOrderModal');
  //   if (modal) {
  //     const bsModal = new (window as any).bootstrap.Modal(modal);
  //     bsModal.show();
  //   }
  // }

  askDeleteOrder(order: Order) {
    this.deleteOrderMsg = `Delete order ${order.uuid}?`;
    this.toBeDeletedOrder = order;
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  deleteOrder() {
    if (this.toBeDeletedOrder) {
      this.orderService.deleteOrderByUuid(this.toBeDeletedOrder.uuid).subscribe({
        next: () => {
          // this.orders.splice(index, 1);
          this.orders = this.orders.filter(c => c.uuid !== this.toBeDeletedOrder?.uuid);
          this.toastType = "warning";
          this.toastMsg = "Order deleted";
          this.showToast = true;
        },
        error: (err) => {
          this.toastType = "error";
          this.toastMsg = err?.error?.message || 'Error deleting order';
          this.showToast = true;
        },
      });
    }
  }

  askDeleteAllOrders(): void {
    this.deleteAllOrdersMsg = 'Delete all orders ?';
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  deleteAllOrders(): void {
    this.orderService.deleteAllOrders().subscribe({
      next: () => {
        this.orders = [];
        this.toastType = "warning";
        this.toastMsg = "All orders deleted";
        this.showToast = true;
      },
      error: (err) => {
        this.toastType = "error";
        this.toastMsg = err?.error?.message || 'Error deleting orders';
        this.showToast = true;
      },
    });
  }

  orderSuccess(order: Order): void {
    if (this.editingOrder) {
      this.editingOrder.count = order.count;
      this.editingOrder.jobType = order.jobType;
      this.editingOrder.depositAmount = order.depositAmount;
      this.toastMsg = "Order updated.";
    }
    else {
      this.orders.push(order);
      this.toastMsg = "Order added.";
    }
    this.toastType = "success";
    this.showToast = true;
  }

  orderError(errorStr: string): void {
    this.toastMsg = errorStr;
    this.toastType = "error";
    this.showToast = true;
  }

  toastCloseAction(): void {
    this.showToast = false
  }

  openOrderDetails(order: Order) {
    this.router.navigate(['/dashboard/order', order.uuid]);
  }
}
