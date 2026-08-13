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

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ExpenseModalComponent, ToastComponent, ConfirmDialogComponent, TimeElapsedPipe],
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
