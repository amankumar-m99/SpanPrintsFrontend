import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { Expense } from '../../model/expense.model';
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
  isSubmitting = false;
  filteredOrders: any[] = [];   // filtered & sorted list
  filterStatus: string = '';    // holds dropdown value
  sortBy: string = 'createdAt_desc';
  searchTerm: string = '';
  activeFiltersCount = 0;
  activeFiltersSummary = '';
  viewType = "card";

  showToast = false;
  toastType = 'info';
  toastMsg = '';
  deleteExpenseMsg = '';
  deleteAllExpensesMsg = '';
  editingExpense!: Expense | null;
  toBeDeletedExpense !: Expense | null;
  isRefreshTableData = false;

  @ViewChild('launchExpenseModalButton') launchExpenseModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteExpenseButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllExpensesButton') launchConfirmDeleteAllButton!: ElementRef;
  @Output() save = new EventEmitter<any>();

  constructor(private router: Router, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses() {
    this.expenseService.getAllExpenses().subscribe({
      next: (res) => {
        this.expenses = res;
        this.applyFilters();
        if (this.isRefreshTableData) {
          this.toastType = "success";
          this.toastMsg = "Expenses refreshed.";
          this.showToast = true;
          this.isRefreshTableData = false;
        }
      },
      error: (err) => {
        this.toastType = "error";
        this.toastMsg = err?.error?.message || 'Error loading expenses';
        this.showToast = true;
        this.isRefreshTableData = false;
      }
    });
  }

  refreshTable(): void {
    this.isRefreshTableData = true;
    this.loadExpenses();
  }

  applyFilters() {
    let data = [...this.expenses];

    // 🔍 Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.description.toLowerCase().includes(term) ||
        o.amount.toString().includes(term)
      );
    }

    // 📌 Status filter
    if (this.filterStatus) {
      data = data.filter(o => o.expenseType === this.filterStatus);
    }

    // ↕ Sorting
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
  //

  addExpense(): void {
    this.editingExpense = null;
    this.launchExpenseModalButton.nativeElement.click();
  }

  editExpense(expense: Expense) {
    this.editingExpense = expense;
    this.launchExpenseModalButton.nativeElement.click();
  }

  askDeleteExpense(expense: Expense) {
    this.deleteExpenseMsg = `Delete vendor ${expense.uuid}?`;
    this.toBeDeletedExpense = expense;
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  deleteExpense() {
    if (this.toBeDeletedExpense) {
      this.expenseService.deleteExpenseByUuid(this.toBeDeletedExpense.uuid).subscribe({
        next: () => {
          this.expenses = this.expenses.filter(c => c.uuid !== this.toBeDeletedExpense?.uuid);
          this.toastType = "warning";
          this.toastMsg = "Expense deleted";
          this.showToast = true;
        },
        error: (err) => {
          this.toastType = "error";
          this.toastMsg = err?.error?.message || 'Error deleting expense';
          this.showToast = true;
        },
      });
    }
  }

  askDeleteAllExpenses() {
    this.deleteAllExpensesMsg = 'Delete all expenses';
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  deleteAllExpenses(): void {
    this.expenseService.deleteAllExpenses().subscribe({
      next: () => {
        this.expenses = [];
        this.toastType = "warning";
        this.toastMsg = "All Expenses deleted";
        this.showToast = true;
      },
      error: (err) => {
        this.toastType = "error";
        this.toastMsg = err?.error?.message || 'Error deleting expenses';
        this.showToast = true;
      },
    });
  }

  expenseSuccess(expense: Expense): void {
    if (this.editingExpense) {
      this.editingExpense.amount = expense.amount;
      this.toastMsg = "Expense updated.";
    }
    else {
      this.expenses.push(expense);
      this.toastMsg = "Expense added.";
    }
    this.toastType = "success";
    this.showToast = true;
  }

  expenseError(errorStr: string): void {
    this.toastMsg = errorStr;
    this.toastType = "error";
    this.showToast = true;
  }

  toastCloseAction(): void {
    this.showToast = false
  }

  openExpenseProfile(expense: Expense) {
    this.router.navigate(['/dashboard/vendor', expense.uuid]);
  }

}
