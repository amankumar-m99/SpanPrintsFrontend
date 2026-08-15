import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ExpenseModalComponent } from "./expense-modal/expense-modal.component";
import { Router } from '@angular/router';
import { ToastComponent } from "../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";
import { TimeElapsedPipe } from "../../pipes/timeElapsed/time-elapsed.pipe";
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense/expense.model';
import { EnumdisplayPipe } from "../../pipes/enumdisplay/enumdisplay.pipe";
import { ExpenseFilterRequest } from '../../model/expense/expense-filter-request.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ExpenseModalComponent, ToastComponent, ConfirmDialogComponent, TimeElapsedPipe, EnumdisplayPipe],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})

export class ExpensesComponent implements OnInit {

  expenses: Expense[] = [];
  paginatedExpenses: Expense[] = [];
  tempExpense !: Expense | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;
  isFilterViewExpanded = this.loadFilterExpandedViewState();

  pageSizes: number[] = [5, 10, 25, 50];
  pageSize = this.loadPageSizeState();
  currentPage = 1;
  totalPages = 1;
  totalExpenses = 0;
  pages: number[] = [];

  dateOfExpenseFrom: string | null = null;
  dateOfExpenseTo: string | null = null;
  expenseSourceFilter: string | null = null;
  descriptionFilter: string | null = null;
  amountMin: number | null = null;
  amountMax: number | null = null;

  expenseSourceOptions = [
    { value: 'BUSINESS', label: 'Business' },
    { value: 'PERSONAL', label: 'Personal' }
  ];

  @ViewChild('launchExpenseModalButton') launchExpenseModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteExpenseButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllExpensesButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private router: Router, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadFilterExpandedViewState(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedValue = window.localStorage.getItem('expenses.filter-pane-expanded');
    return storedValue === 'true';
  }

  private saveFilterExpandedViewState(expanded: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('expenses.filter-pane-expanded', String(expanded));
  }

  toggleFilterView(): void {
    this.isFilterViewExpanded = !this.isFilterViewExpanded;
    this.saveFilterExpandedViewState(this.isFilterViewExpanded);
  }

  get startIndex(): number {
    return this.totalExpenses === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalExpenses);
  }

  private buildPages(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  private loadPageSizeState(): number {
    if (typeof window === 'undefined') {
      return 10;
    }

    const storedValue = window.localStorage.getItem('expenses.pageSizeState');
    const pageSize = Number(storedValue);
    return [5, 10, 25, 50].includes(pageSize) ? pageSize : 10;
  }

  private savePageSizeState(pageSize: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('expenses.pageSizeState', String(pageSize));
  }

  filterExpenses(items: Expense[] = this.expenses): Expense[] {
    let filtered = [...items];

    if (this.dateOfExpenseFrom) {
      filtered = filtered.filter((expense) => this.parseLocalDate(expense.dateOfExpense) >= this.parseLocalDate(this.dateOfExpenseFrom!));
    }

    if (this.dateOfExpenseTo) {
      const toDate = new Date(this.dateOfExpenseTo + 'T23:59:59.999');
      filtered = filtered.filter((expense) => this.parseLocalDate(expense.dateOfExpense) <= toDate);
    }

    if (this.expenseSourceFilter) {
      filtered = filtered.filter((expense) => expense.expenseType === this.expenseSourceFilter);
    }

    if (this.amountMin !== null && this.amountMin !== undefined) {
      filtered = filtered.filter((expense) => expense.amount >= this.amountMin!);
    }

    if (this.amountMax !== null && this.amountMax !== undefined) {
      filtered = filtered.filter((expense) => expense.amount <= this.amountMax!);
    }

    return filtered;
  }

  updateDisplayedExpenses(): void {
    const filteredExpenses = this.filterExpenses(this.expenses);
    this.totalExpenses = filteredExpenses.length;
    this.totalPages = this.totalExpenses === 0 ? 1 : Math.ceil(this.totalExpenses / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + this.pageSize);
    this.buildPages();
  }

  private parseLocalDate(value: string): Date {
    if (!value) {
      return new Date(0);
    }

    return new Date(value.includes('T') ? value : `${value}T00:00:00`);
  }

  loadData() {
    this.expenseService.getExpensesPaginated(this.currentPage - 1, this.pageSize, this.buildFilterRequest()).subscribe({
      next: (res) => {
        this.expenses = res.elements;
        this.totalExpenses = res.totalElements;
        this.totalPages = res.numberOfTotalPages || 1;
        this.buildPages();
        this.paginatedExpenses = this.expenses;
        if (this.isRefreshingData) {
          this.showToastComponent("success", "Expenses data refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading expenses');
        this.isRefreshingData = false;
      },
    });
  }

  refreshData(): void {
    this.isRefreshingData = true;
    this.loadData();
  }

  private buildFilterRequest(): ExpenseFilterRequest {
    return {
      dateOfExpenseFrom: this.dateOfExpenseFrom,
      dateOfExpenseTo: this.dateOfExpenseTo,
      expenseType: this.expenseSourceFilter,
      description: this.descriptionFilter,
      amountMin: this.amountMin,
      amountMax: this.amountMax
    };
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadDataWithFilters();
  }

  clearFilters(): void {
    this.dateOfExpenseFrom = null;
    this.dateOfExpenseTo = null;
    this.expenseSourceFilter = null;
    this.descriptionFilter = null;
    this.amountMin = null;
    this.amountMax = null;
    this.currentPage = 1;
    this.loadDataWithFilters();
  }

  private loadDataWithFilters(): void {
    this.expenseService.getExpensesPaginated(this.currentPage - 1, this.pageSize, this.buildFilterRequest()).subscribe({
      next: (res) => {
        this.expenses = res.elements;
        this.totalExpenses = res.totalElements;
        this.totalPages = res.numberOfTotalPages || 1;
        this.buildPages();
        this.paginatedExpenses = this.expenses;
      },
      error: (err) => {
        this.showToastComponent('error', err?.error?.message || 'Error loading filtered expenses');
      }
    });
  }

  changePage(page: number): void {
    const normalizedPage = Math.max(1, Math.min(page, this.totalPages || 1));
    if (normalizedPage === this.currentPage) {
      return;
    }

    this.currentPage = normalizedPage;
    this.loadData();
  }

  changePageSize(size: number): void {
    this.pageSize = +size;
    this.currentPage = 1;
    this.savePageSizeState(this.pageSize);
    this.loadData();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.loadData();
    }
  }

  addExpense(): void {
    this.tempExpense = null;
    this.launchExpenseModal();
  }

  editExpense(expense: Expense) {
    this.tempExpense = expense;
    this.launchExpenseModal();
  }

  askDeleteExpense(expense: Expense): void {
    this.deleteMsg = `Delete expense ${expense.uuid}?`;
    this.tempExpense = expense;
    this.launchConfirmDeleteModal();
  }

  deleteExpense() {
    if (this.tempExpense) {
      this.expenseService.deleteExpenseByUuid(this.tempExpense.uuid).subscribe({
        next: () => {
          this.expenses = this.expenses.filter(c => c.uuid !== this.tempExpense?.uuid);
          this.showToastComponent("warning", "Expense deleted");
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting expense');
        },
      });
    }
  }

  askDeleteAllExpenses() {
    this.deleteMsg = 'Delete all expenses?';
    this.launchConfirmDeleteAllModal();
  }

  deleteAllExpenses(): void {
    this.expenseService.deleteAllExpenses().subscribe({
      next: () => {
        this.expenses = [];
        this.showToastComponent("warning", "All expenses deleted");
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error deleting expenses');
      },
    });
  }

  successAction(expense: Expense): void {
    if (this.tempExpense) {
      // let index = this.expenses.findIndex(c => c.id === this.tempExpense?.id);
      // if (index !== -1) {
      //   this.expenses[index] = { ...this.tempExpense };
      // }
      this.toastMsg = "Expense updated.";
    }
    else {
      // this.expenses.push(expense);
      this.toastMsg = "Expense added.";
    }
    this.tempExpense = null;
    this.showToastComponent("success", this.toastMsg);
    this.loadData();
  }

  errorAction(errorStr: string): void {
    this.showToastComponent("error", errorStr);
  }

  launchExpenseModal(): void {
    this.launchExpenseModalButton.nativeElement.click();
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

  openDetails(expense: Expense) {
    this.router.navigate(['/dashboard/expense', expense.uuid]);
  }

}
