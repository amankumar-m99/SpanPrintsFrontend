import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LedgerService } from '../../services/ledger/ledger.service';
import { LedgerEntry } from '../../model/ledger/ledger-entry.model';
import { ToastComponent } from "../utility/toast/toast.component";
import { Router } from '@angular/router';
import { TimeElapsedPipe } from "../../pipes/timeElapsed/time-elapsed.pipe";
import { LedgerFilterRequest } from '../../model/ledger/ledger-filter-request.model';
import { Constant } from '../../constant/Constant';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent, TimeElapsedPipe],
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.css']
})
export class LedgerComponent implements OnInit {

  ledgerEntries: LedgerEntry[] = [];
  isRefreshingData = false;
  toastType = 'info';
  toastMsg = '';
  showToast = false;
  isFilterViewExpanded = this.loadFilterExpandedViewState();

  pageSizes: number[] = [5, 10, 25, 50];
  pageSize = this.loadPageSizeState();
  currentPage = this.loadCurrentPageState();
  totalPages = 1;
  totalLedgerEntries = 0;
  pages: number[] = [];

  ledgerEntryTypeOptions: string[] = ['CREDIT', 'DEBIT'];
  ledgerEntrySourceOptions: string[] = ['ORDER', 'PURCHASE', 'PERSONAL', 'INVESTMENT', 'REFUND', 'OTHER'];

  selectedLedgerEntryTypes: string[] = [];
  selectedLedgerEntrySources: string[] = [];
  amountMin: number | null = null;
  amountMax: number | null = null;
  transactionDateMin: string | null = null;
  transactionDateMax: string | null = null;
  uuidFilter: string | null = null;
  descriptionFilter: string | null = null;

  constructor(
    private router: Router,
    private ledgerService: LedgerService
  ) { }

  ngOnInit(): void {
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  private buildFilterRequest(): LedgerFilterRequest {
    return {
      ledgerEntryTypes: [...this.selectedLedgerEntryTypes],
      ledgerEntrySources: [...this.selectedLedgerEntrySources],
      amountMin: this.amountMin,
      amountMax: this.amountMax,
      transactionDateMin: this.transactionDateMin,
      transactionDateMax: this.transactionDateMax,
      uuid: this.uuidFilter,
      description: this.descriptionFilter
    };
  }

  loadData(page: number = 1, size: number = this.pageSize, filter: LedgerFilterRequest = this.buildFilterRequest()) {
    this.currentPage = page;
    this.pageSize = size;

    this.ledgerService.getAllLedgerEntriesPaginated(this.currentPage - 1, this.pageSize, filter).subscribe({
      next: (res) => {
        this.ledgerEntries = res.elements;
        this.totalLedgerEntries = res.totalElements;
        this.totalPages = res.numberOfTotalPages || 1;
        this.buildPages();

        if (this.isRefreshingData) {
          this.showToastComponent("success", "Ledger data refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading ledger entries');
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
    this.selectedLedgerEntryTypes = [];
    this.selectedLedgerEntrySources = [];
    this.amountMin = null;
    this.amountMax = null;
    this.transactionDateMin = null;
    this.transactionDateMax = null;
    this.uuidFilter = null;
    this.descriptionFilter = null;
    this.currentPage = 1;
    this.saveCurrentPageState(this.currentPage);
    this.loadData(this.currentPage, this.pageSize, this.buildFilterRequest());
  }

  toggleSelection(field: 'ledgerEntryTypes' | 'ledgerEntrySources', value: string, checked: boolean): void {
    const selectedValues = field === 'ledgerEntryTypes' ? this.selectedLedgerEntryTypes : this.selectedLedgerEntrySources;

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
  }

  isSelected(field: 'ledgerEntryTypes' | 'ledgerEntrySources', value: string): boolean {
    const selectedValues = field === 'ledgerEntryTypes' ? this.selectedLedgerEntryTypes : this.selectedLedgerEntrySources;
    return selectedValues.includes(value);
  }

  toggleFilterView() {
    this.isFilterViewExpanded = !this.isFilterViewExpanded;
    this.saveFilterExpandedViewState(this.isFilterViewExpanded);
  }

  private buildPages(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  get startIndex(): number {
    return this.totalLedgerEntries === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalLedgerEntries);
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

  private loadFilterExpandedViewState(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedValue = window.localStorage.getItem(Constant.ledgerPageFilterExpandedKey);
    return storedValue === 'true';
  }

  private saveFilterExpandedViewState(expanded: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.ledgerPageFilterExpandedKey, String(expanded));
  }

  private loadCurrentPageState(): number {
    if (typeof window === 'undefined') {
      return 1;
    }

    const storedValue = window.localStorage.getItem(Constant.ledgerCurrentPageState);
    const page = Number(storedValue);
    return page > 0 ? page : 1;
  }

  private loadPageSizeState(): number {
    if (typeof window === 'undefined') {
      return 10;
    }

    const storedValue = window.localStorage.getItem(Constant.ledgerPageSizeState);
    const pageSize = Number(storedValue);
    return this.pageSizes.includes(pageSize) ? pageSize : 10;
  }

  private savePageSizeState(pageSize: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.ledgerPageSizeState, String(pageSize));
  }

  private saveCurrentPageState(page: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.ledgerCurrentPageState, String(page));
  }

  get totalCredit() {
    return this.ledgerEntries
      .filter(t => t.ledgerEntryType === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalDebit() {
    return this.ledgerEntries
      .filter(t => t.ledgerEntryType === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get netEarnings() {
    return this.totalCredit - this.totalDebit;
  }

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }

  openDetails(ledger: LedgerEntry) {
    // ORDER, PURCHASE, REFUND, PERSONAL, INVESTMENT, OTHER
    if (ledger.ledgerEntrySource === 'ORDER' && ledger.printJobUuid) {
      this.router.navigate(['/dashboard/order', ledger.printJobUuid]);
    }
    else if ((ledger.ledgerEntrySource === 'PURCHASE' || ledger.ledgerEntrySource === 'PERSONAL') && ledger.expenseUuid) {
      this.router.navigate(['/dashboard/expense', ledger.expenseUuid]);
    }
    else if (ledger.ledgerEntrySource === 'INVESTMENT' && ledger.investmentUuid) {
      this.router.navigate(['/dashboard/investment', ledger.investmentUuid]);
    }
  }
}
