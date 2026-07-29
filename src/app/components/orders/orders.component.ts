import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Order } from '../../model/order/order.model';
import { OrderService } from '../../services/order/order.service';
import { OrderModalComponent } from "./order-modal/order-modal.component";
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";
import { Router } from '@angular/router';
import { ToastComponent } from "../utility/toast/toast.component";
import { DaysElapsedPipe } from "../../pipes/days-elapsed/days-elapsed.pipe";
import { TimeElapsedPipe } from "../../pipes/timeElapsed/time-elapsed.pipe";
import { OrderFilterRequest } from '../../model/order/order-filter-request.model';
import { PrintJobTypeService } from '../../services/order/printjobtype.service';
import { PrintJobType } from '../../model/order/printjobtype.model';
import { EnumOption, enumToOptions } from '../../enums/enum-helper.';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { Constant } from '../../constant/Constant';
import { filter } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OrderModalComponent, ConfirmDialogComponent, ToastComponent, DaysElapsedPipe, TimeElapsedPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})

export class OrdersComponent implements OnInit {

  //visible cols
  fieldsVisibilityForm!: FormGroup;

  orders: Order[] = [];
  tempOrder !: Order | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;

  isFilterViewExpanded = this.loadFilterExpandedViewState();

  printJobTypeOptions: PrintJobType[] = [];
  orderStatusOptions: EnumOption[] = enumToOptions(OrderStatus);
  paymentStatusOptions: EnumOption[] = enumToOptions(PaymentStatus);

  selectedJobNames: string[] = [];
  selectedPaymentStatuses: string[] = [];
  selectedOrderStatuses: string[] = [];

  quantityMin: number | null = null;
  quantityMax: number | null = null;
  totalAmountMin: number | null = null;
  totalAmountMax: number | null = null;
  discountedAmountMin: number | null = null;
  discountedAmountMax: number | null = null;
  pendingAmountMin: number | null = null;
  pendingAmountMax: number | null = null;
  deliveryDateMin: string | null = null;
  deliveryDateMax: string | null = null;
  placedOnMin: string | null = null;
  placedOnMax: string | null = null;
  bookNumberFilter: string | null = null;
  customerNameFilter: string | null = null;
  customerPhoneFilter: string | null = null;

  // Pagination state
  pageSizes: number[] = [5, 10, 25, 50];
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  pages: number[] = [];

  @ViewChild('launchOrderModalButton') launchOrderModalButton !: ElementRef;
  @ViewChild('launchConfirmDeleteOrderButton') launchConfirmDeleteButton !: ElementRef;
  @ViewChild('launchConfirmDeleteAllOrdersButton') launchConfirmDeleteAllButton !: ElementRef;

  constructor(private fb: FormBuilder,
    private router: Router,
    private orderService: OrderService,
    private printJobTypeService: PrintJobTypeService
  ) { }

  ngOnInit(): void {
    this.initFieldsVisibilityForm();
    this.loadFilterOptions();
    this.loadOrders();
  }

  private loadFilterExpandedViewState(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedValue = window.localStorage.getItem(Constant.ordersPageFilterExpandedKey);
    return storedValue === 'true';
  }

  private saveFilterExpandedViewState(collapsed: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.ordersPageFilterExpandedKey, String(collapsed));
  }

  toggleFilterView() {
    this.isFilterViewExpanded = !this.isFilterViewExpanded;
    this.saveFilterExpandedViewState(this.isFilterViewExpanded);
  }

  private initFieldsVisibilityForm() {
    this.fieldsVisibilityForm = this.fb.group({
      jobName: [this.loadFieldsSelectionState('fieldJobName')],
      jobCode: [this.loadFieldsSelectionState('fieldJobCode')],
      quantity: [this.loadFieldsSelectionState('fieldQuantity')],
      deliveryDate: [this.loadFieldsSelectionState('fieldDeliveryDate')],
      bookNumber: [this.loadFieldsSelectionState('fieldBookNumber')],
      customerName: [this.loadFieldsSelectionState('fieldCustomerName')],
      customerPhone: [this.loadFieldsSelectionState('fieldCustomerPhone')],
      customerAddress: [this.loadFieldsSelectionState('fieldCustomerAddress')],
      placedOn: [this.loadFieldsSelectionState('fieldPlacedOn')],
      orderStatus: [this.loadFieldsSelectionState('fieldOrderStatus')],
      paymentStatus: [this.loadFieldsSelectionState('fieldPaymentStatus')],
      totalAmount: [this.loadFieldsSelectionState('fieldTotalAmount')],
      discountAmount: [this.loadFieldsSelectionState('fieldDiscountAmount')],
      depositAmount: [this.loadFieldsSelectionState('fieldDepositAmount')],
      pendingAmount: [this.loadFieldsSelectionState('fieldPendingAmount')],
      updatedAt: [this.loadFieldsSelectionState('fieldUpdatedAt')],
      createdAt: [this.loadFieldsSelectionState('fieldCreatedAt')],
      createdBy: [this.loadFieldsSelectionState('fieldCreatedBy')]
    });
  }

  get jobName() { return this.fieldsVisibilityForm.get('jobName'); }
  get jobCode() { return this.fieldsVisibilityForm.get('jobCode'); }
  get quantity() { return this.fieldsVisibilityForm.get('quantity'); }
  get deliveryDate() { return this.fieldsVisibilityForm.get('deliveryDate'); }
  get bookNumber() { return this.fieldsVisibilityForm.get('bookNumber'); }
  get customerName() { return this.fieldsVisibilityForm.get('customerName'); }
  get customerPhone() { return this.fieldsVisibilityForm.get('customerPhone'); }
  get customerAddress() { return this.fieldsVisibilityForm.get('customerAddress'); }
  get placedOn() { return this.fieldsVisibilityForm.get('placedOn'); }
  get orderStatus() { return this.fieldsVisibilityForm.get('orderStatus'); }
  get paymentStatus() { return this.fieldsVisibilityForm.get('paymentStatus'); }
  get totalAmount() { return this.fieldsVisibilityForm.get('totalAmount'); }
  get discountAmount() { return this.fieldsVisibilityForm.get('discountAmount'); }
  get depositAmount() { return this.fieldsVisibilityForm.get('depositAmount'); }
  get pendingAmount() { return this.fieldsVisibilityForm.get('pendingAmount'); }
  get updatedAt() { return this.fieldsVisibilityForm.get('updatedAt'); }
  get createdAt() { return this.fieldsVisibilityForm.get('createdAt'); }
  get createdBy() { return this.fieldsVisibilityForm.get('createdBy'); }

  get startIndex(): number {
    return this.totalOrders === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalOrders);
  }

  private loadFilterOptions(): void {
    this.printJobTypeService.getAllPrintJobTypes().subscribe({
      next: (resp) => {
        this.printJobTypeOptions = resp;
      },
      error: () => this.printJobTypeOptions = []
    });

    /*
    this.orderService.getAllPaymentStatuses().subscribe({
      next: (statuses: string[]) => this.paymentStatusOptions = statuses ?? [],
      error: () => this.paymentStatusOptions = []
    });

    this.orderService.getAllOrderStatuses().subscribe({
      next: (statuses: string[]) => this.orderStatusOptions = statuses ?? [],
      error: () => this.orderStatusOptions = []
    });
    */
  }

  private buildFilterRequest(): OrderFilterRequest {
    return {
      jobTypeIds: [...this.selectedJobNames],
      paymentStatuses: [...this.selectedPaymentStatuses],
      orderStatuses: [...this.selectedOrderStatuses],
      quantityMin: this.quantityMin,
      quantityMax: this.quantityMax,
      totalAmountMin: this.totalAmountMin,
      totalAmountMax: this.totalAmountMax,
      discountedAmountMin: this.discountedAmountMin,
      discountedAmountMax: this.discountedAmountMax,
      pendingAmountMin: this.pendingAmountMin,
      pendingAmountMax: this.pendingAmountMax,
      deliveryDateMin: this.deliveryDateMin,
      deliveryDateMax: this.deliveryDateMax,
      placedOnMin: this.placedOnMin,
      placedOnMax: this.placedOnMax,
      bookNumber: this.bookNumberFilter,
      customerName: this.customerNameFilter,
      customerPhone: this.customerPhoneFilter
    };
  }

  toggleSelection(field: 'jobTypeIds' | 'paymentStatuses' | 'orderStatuses', value: string, checked: boolean): void {
    const selectedValues = this.getSelectedValues(field);

    if (checked) {
      if (!selectedValues.includes(value)) {
        selectedValues.push(value);
      }
    } else {
      const index = selectedValues.indexOf(value);
      if (index >= 0) {
        selectedValues.splice(index, 1);
      }
    }

    this.syncSelection(field, selectedValues);
  }

  private getSelectedValues(field: 'jobTypeIds' | 'paymentStatuses' | 'orderStatuses'): string[] {
    if (field === 'jobTypeIds') {
      return this.selectedJobNames;
    }

    if (field === 'paymentStatuses') {
      return this.selectedPaymentStatuses;
    }

    return this.selectedOrderStatuses;
  }

  private syncSelection(field: 'jobTypeIds' | 'paymentStatuses' | 'orderStatuses', values: string[]): void {
    if (field === 'jobTypeIds') {
      this.selectedJobNames = values;
      return;
    }

    if (field === 'paymentStatuses') {
      this.selectedPaymentStatuses = values;
      return;
    }

    this.selectedOrderStatuses = values;
  }

  isSelected(field: 'jobTypeIds' | 'paymentStatuses' | 'orderStatuses', value: string): boolean {
    return this.getSelectedValues(field).includes(value);
  }

  loadOrders(page: number = 1, size: number = this.pageSize, filter: OrderFilterRequest = this.buildFilterRequest(), msg: string = ''): void {
    this.currentPage = page;
    this.pageSize = size;
    this.orderService.getAllOrdersPaginated(this.currentPage - 1, this.pageSize, filter).subscribe({
      next: (resp) => {
        this.orders = resp.orders;
        this.totalOrders = resp.totalElements;
        this.totalPages = resp.numberOfTotalPages;
        this.buildPages();
        if (this.isRefreshingData || msg != '') {
          this.showToastComponent("success", msg);
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading orders');
        this.isRefreshingData = false;
      },
    });
  }

  private loadFieldsSelectionState(field: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedValue = window.localStorage.getItem(Constant.ordersFieldSelectionState + '.' + String(field));
    return storedValue === 'true';
  }

  saveFieldsSelectionState(field: any, value: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.ordersFieldSelectionState + '.' + String(field), String(value));
  }

  private buildPages(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  changePage(page: number): void {
    if (page === this.currentPage) return;
    this.loadOrders(page, this.pageSize, this.buildFilterRequest());
  }

  changePageSize(size: number): void {
    this.pageSize = +size;
    this.currentPage = 1;
    this.loadOrders(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1, this.pageSize, this.buildFilterRequest());
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadOrders(this.currentPage + 1, this.pageSize, this.buildFilterRequest());
    }
  }

  refreshTable(): void {
    this.isRefreshingData = true;
    this.loadOrders(1, this.pageSize, this.buildFilterRequest(), "Orders refreshed.");
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadOrders(1, this.pageSize, this.buildFilterRequest(), 'Filter applied');
  }

  clearFilters(): void {
    this.selectedJobNames = [];
    this.selectedPaymentStatuses = [];
    this.selectedOrderStatuses = [];
    this.quantityMin = null;
    this.quantityMax = null;
    this.totalAmountMin = null;
    this.totalAmountMax = null;
    this.discountedAmountMin = null;
    this.discountedAmountMax = null;
    this.pendingAmountMin = null;
    this.pendingAmountMax = null;
    this.deliveryDateMin = null;
    this.deliveryDateMax = null;
    this.placedOnMin = null;
    this.placedOnMax = null;
    this.bookNumberFilter = null;
    this.customerNameFilter = null;
    this.customerPhoneFilter = null;
    this.currentPage = 1;
    this.loadOrders(1, this.pageSize, this.buildFilterRequest(), 'Filter cleared');
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

}

