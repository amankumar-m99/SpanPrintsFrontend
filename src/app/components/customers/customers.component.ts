import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../model/customer/customer.model';
import { Router, RouterLink } from '@angular/router';
import { CustomerModalComponent } from "./customer-modal/customer-modal.component";
import { CustomerService } from '../../services/customer/customer.service';
import { ToastComponent } from "../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";
import { TimeElapsedPipe } from "../../pipes/timeElapsed/time-elapsed.pipe";
import { Constant } from '../../constant/Constant';
import { CustomerFilterRequest } from '../../model/customer/customer-filter-request.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerModalComponent, ToastComponent, ConfirmDialogComponent, TimeElapsedPipe, RouterLink],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})

export class CustomersComponent implements OnInit {

  customers: Customer[] = [];
  tempCustomer !: Customer | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;
  isFilterViewExpanded = this.loadFilterExpandedViewState();

  nameFilter: string | null = null;
  emailFilter: string | null = null;
  phoneFilter: string | null = null;
  addressFilter: string | null = null;
  outstandingMin: number | null = null;
  outstandingMax: number | null = null;
  orderCountMin: number | null = null;
  orderCountMax: number | null = null;

  pageSizes: number[] = [5, 10, 25, 50];
  pageSize = this.loadPageSizeState();
  currentPage = this.loadCurrentPageState();
  totalPages = 1;
  totalCustomers = 0;
  pages: number[] = [];
  @ViewChild('launchCustomerModalButton') launchCustomerModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteCustomerButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllCustomersButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private router: Router,
    private customerService: CustomerService) { }

  ngOnInit(): void {
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  loadData(page: number = 1, size: number = this.pageSize, filter: CustomerFilterRequest = this.buildFilterRequest()) {
    this.currentPage = page;
    this.pageSize = size;
    this.customerService.getCustomersPaginated(this.currentPage - 1, this.pageSize, filter).subscribe({
      next: (res) => {
        this.customers = res.elements;
        this.totalCustomers = res.totalElements;
        this.totalPages = res.numberOfTotalPages;
        this.buildPages();
        if (this.isRefreshingData) {
          this.showToastComponent("success", "Customers data refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading customers');
        this.isRefreshingData = false;
      },
    });
  }

  refreshData(): void {
    this.isRefreshingData = true;
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.saveCurrentPageState(this.currentPage);
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  clearFilters(): void {
    this.nameFilter = null;
    this.emailFilter = null;
    this.phoneFilter = null;
    this.addressFilter = null;
    this.outstandingMin = null;
    this.outstandingMax = null;
    this.orderCountMin = null;
    this.orderCountMax = null;
    this.currentPage = 1;
    this.saveCurrentPageState(this.currentPage);
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  addCustomer(): void {
    this.tempCustomer = null;
    this.launchCustomerModal();
  }

  editCustomer(customer: Customer) {
    this.tempCustomer = customer;
    this.launchCustomerModal();
  }

  askDeleteCustomer(customer: Customer): void {
    this.deleteMsg = `Delete customer ${customer.name}?`;
    this.tempCustomer = customer;
    this.launchConfirmDeleteModal();
  }

  deleteCustomer() {
    if (this.tempCustomer) {
      this.customerService.deleteCustomerByUuid(this.tempCustomer.uuid).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.uuid !== this.tempCustomer?.uuid);
          this.showToastComponent("warning", "Customer deleted");
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting customer');
        },
      });
    }
  }

  askDeleteAllCustomers(): void {
    this.deleteMsg = 'Delete all customers?';
    this.launchConfirmDeleteModal();
  }

  deleteAllCustomers(): void {
    this.customerService.deleteAllCustomers().subscribe({
      next: () => {
        this.customers = [];
        this.showToastComponent("warning", "All customers deleted");
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error deleting customers');
      },
    });
  }

  successAction(customer: Customer): void {
    if (this.tempCustomer) {
      this.toastMsg = "Customer updated.";
    }
    else {
      this.toastMsg = "Customer added.";
    }
    this.tempCustomer = null;
    this.showToastComponent("success", this.toastMsg);
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  errorAction(errorStr: string): void {
    this.showToastComponent("error", errorStr);
  }

  launchCustomerModal(): void {
    this.launchCustomerModalButton.nativeElement.click();
  }

  launchConfirmDeleteModal(): void {
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  launchConfirmDeleteAllModal(): void {
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  private loadFilterExpandedViewState(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedValue = window.localStorage.getItem(Constant.customersPageFilterExpandedKey);
    return storedValue === 'true';
  }

  private saveFilterExpandedViewState(expanded: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.customersPageFilterExpandedKey, String(expanded));
  }

  toggleFilterView() {
    this.isFilterViewExpanded = !this.isFilterViewExpanded;
    this.saveFilterExpandedViewState(this.isFilterViewExpanded);
  }

  private buildFilterRequest(): CustomerFilterRequest {
    return {
      name: this.nameFilter,
      email: this.emailFilter,
      phone: this.phoneFilter,
      address: this.addressFilter,
      outstandingAmountMin: this.outstandingMin,
      outstandingAmountMax: this.outstandingMax,
      orderCountMin: this.orderCountMin,
      orderCountMax: this.orderCountMax
    };
  }

  get startIndex(): number {
    return this.totalCustomers === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCustomers);
  }

  private buildPages(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  changePage(page: number): void {
    const normalizedPage = Math.max(1, Math.min(page, this.totalPages || 1));
    if (normalizedPage === this.currentPage) return;

    this.currentPage = normalizedPage;
    this.saveCurrentPageState(this.currentPage);
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  changePageSize(size: number): void {
    this.pageSize = +size;
    this.currentPage = 1;
    this.savePageSizeState(this.pageSize);
    this.saveCurrentPageState(this.currentPage);
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  private loadCurrentPageState(): number {
    if (typeof window === 'undefined') {
      return 1;
    }

    const storedValue = window.localStorage.getItem(Constant.customersCurrentPageState);
    const page = Number(storedValue);
    return page > 0 ? page : 1;
  }

  private loadPageSizeState(): number {
    if (typeof window === 'undefined') {
      return 10;
    }

    const storedValue = window.localStorage.getItem(Constant.customersPageSizeState);
    const pageSize = Number(storedValue);
    return this.pageSizes.includes(pageSize) ? pageSize : 10;
  }

  private savePageSizeState(pageSize: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.customersPageSizeState, String(pageSize));
  }

  private saveCurrentPageState(page: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.customersCurrentPageState, String(page));
  }

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }

  openDetails(customer: Customer) {
    this.router.navigate(['/dashboard/customer', customer.uuid]);
  }

}
