import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';
import { ConfirmDialogComponent } from '../../utility/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../utility/toast/toast.component';
import { OrderModalComponent } from '../order-modal/order-modal.component';

@Component({
  selector: 'app-paginated-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderModalComponent, ConfirmDialogComponent, ToastComponent],
  templateUrl: './paginated-orders.component.html',
  styleUrl: './paginated-orders.component.css'
})

export class PaginatedOrdersComponent implements OnInit {

  orders: Order[] = [];
  tempOrder !: Order | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;

  @ViewChild('launchOrderModalButton') launchOrderModalButton !: ElementRef;
  @ViewChild('launchConfirmDeleteOrderButton') launchConfirmDeleteButton !: ElementRef;
  @ViewChild('launchConfirmDeleteAllOrdersButton') launchConfirmDeleteAllButton !: ElementRef;

  constructor(private fb: FormBuilder, private router: Router, private orderService: OrderService) { }

  ngOnInit(): void {
    // this.loadData();
    this.loadOrders();
  }

  loadData() {
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.orders = res;
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

  refreshTable(): void {
    this.isRefreshingData = true;
    this.loadData();
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
    this.loadData();
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

  // Pagination state
  pageSizes: number[] = [5, 10, 25, 50];
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  pages: number[] = [];

  get startIndex(): number {
    return this.totalOrders === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalOrders);
  }

  loadOrders(page: number = 1, size: number = this.pageSize): void {
    this.currentPage = page;
    this.pageSize = size;

    // Replace the following with your real service call and response mapping.
    // Expected response shape: { items: Order[], total: number }
    // Example:
    // this.ordersService.getOrders({ page: this.currentPage, size: this.pageSize }).subscribe(resp => {
    //   this.orders = resp.items;
    //   this.totalOrders = resp.total;
    //   this.totalPages = Math.ceil(this.totalOrders / this.pageSize);
    //   this.buildPages();
    // });

    this.orderService.getAllOrdersPaginated(this.currentPage-1, this.pageSize).subscribe(resp => {
      this.orders = resp.orders;
      this.totalOrders = resp.totalElements;
      this.totalPages = resp.numberOfTotalPages;
      this.buildPages();
    },
  error =>{
    console.log(error);
  });

    // If you currently load all orders locally, update slicing here:
    // this.totalOrders = this.allOrders.length;
    // this.totalPages = Math.ceil(this.totalOrders / this.pageSize);
    // const start = (this.currentPage - 1) * this.pageSize;
    // this.orders = this.allOrders.slice(start, start + this.pageSize);
    // this.buildPages();
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
}
