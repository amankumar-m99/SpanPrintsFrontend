import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { Order } from '../../model/order/order.model';
import { OrderService } from '../../services/order/order.service';
import { OrderModalComponent } from "./order-modal/order-modal.component";
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";
import { Router } from '@angular/router';
import { ToastComponent } from "../utility/toast/toast.component";
import { DateElapsedPipe } from '../../pipes/date-elapsed/date-elapsed.pipe';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderModalComponent, ConfirmDialogComponent, ToastComponent, DateElapsedPipe],
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

  // Pagination state
  pageSizes: number[] = [5, 10, 25, 50];
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  pages: number[] = [];

  //filters
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
    this.loadOrders();
  }

  get startIndex(): number {
    return this.totalOrders === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalOrders);
  }

  loadOrders(page: number = 1, size: number = this.pageSize): void {
    this.currentPage = page;
    this.pageSize = size;
    this.orderService.getAllOrdersPaginated(this.currentPage - 1, this.pageSize).subscribe({
      next: (resp) => {
        this.orders = resp.orders;
        this.totalOrders = resp.totalElements;
        this.totalPages = resp.numberOfTotalPages;
        this.buildPages();
        if (this.isRefreshingData) {
          this.showToastComponent("success", "Orders refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading orders');
        this.isRefreshingData = false;
      },
    });
  }

  private buildPages(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  changePage(page: number): void {
    if (page === this.currentPage) return;
    this.loadOrders(page, this.pageSize);
  }

  changePageSize(size: number): void {
    this.pageSize = +size;
    this.currentPage = 1;
    this.loadOrders(this.currentPage, this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1, this.pageSize);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadOrders(this.currentPage + 1, this.pageSize);
    }
  }

  refreshTable(): void {
    this.isRefreshingData = true;
    this.loadOrders();
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
          this.showToastComponent("warning", "Order deleted");
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting order');
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
      // let index = this.orders.findIndex(c => c.id === this.tempOrder?.id);
      // if (index !== -1) {
      //   this.orders[index] = { ...this.tempOrder };
      // }
      this.toastMsg = "Order updated.";
    }
    else {
      // this.orders.push(order);
      this.toastMsg = "Order added.";
    }
    this.tempOrder = null;
    this.showToastComponent("success", this.toastMsg);
    this.loadOrders();
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
    this.router.navigate(['/dashboard/order', order.uuid]);
  }

  applyFilters() {
    let data = [...this.orders];
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.customerName.toLowerCase().includes(term) ||
        o.customerPrimaryPhoneNumber.includes(term)
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

}

