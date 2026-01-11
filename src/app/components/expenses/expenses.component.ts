import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { Expense } from '../../model/expense/expense.model';
import { ExpenseService } from '../../services/expense/expense.service';
import { ExpenseCardComponent } from './expense-card/expense-card.component';
import { ExpenseModalComponent } from "./expense-modal/expense-modal.component";
import { Router } from '@angular/router';
import { ToastComponent } from "../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ExpenseCardComponent, ExpenseModalComponent, ToastComponent, ConfirmDialogComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})

export class ExpensesComponent implements OnInit {

  expenses: Expense[] = [];
  tempExpense !: Expense | null;
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
  viewType = "card";

  @ViewChild('launchExpenseModalButton') launchExpenseModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteExpenseButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllExpensesButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private router: Router, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.expenseService.getAllExpenses().subscribe({
      next: (res) => {
        this.expenses = res;
        this.applyFilters();
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

  applyFilters() {
    let data = [...this.expenses];
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.description.toLowerCase().includes(term) ||
        o.amount.toString().includes(term)
      );
    }
    // Status filter
    if (this.filterStatus) {
      data = data.filter(o => o.expenseType === this.filterStatus);
    }
    // Sorting
    switch (this.sortBy) {
      case 'createdAt_desc':
        data.sort((a, b) => +new Date(b.dateOfExpense) - +new Date(a.dateOfExpense));
        break;
      case 'createdAt_asc':
        data.sort((a, b) => +new Date(a.dateOfExpense) - +new Date(b.dateOfExpense));
        break;
      case 'amount_desc':
        data.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        data.sort((a, b) => a.amount - b.amount);
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

  changeViewType(type: string): void {
    this.viewType = type;
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
      let index = this.expenses.findIndex(c => c.id === this.tempExpense?.id);
      if (index !== -1) {
        this.expenses[index] = { ...this.tempExpense };
      }
      this.toastMsg = "Expense updated.";
    }
    else {
      this.expenses.push(expense);
      this.toastMsg = "Expense added.";
    }
    this.showToastComponent("success", this.toastMsg);
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
