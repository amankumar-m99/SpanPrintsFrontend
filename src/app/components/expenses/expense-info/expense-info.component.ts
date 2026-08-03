import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../../utility/confirm-dialog/confirm-dialog.component";
import { FormsModule } from '@angular/forms';
import { Constant } from '../../../constant/Constant';
import { Order } from '../../../model/order/order.model';
import { TimeElapsedPipe } from "../../../pipes/timeElapsed/time-elapsed.pipe";
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';
import { ExpenseService } from '../../../services/expense/expense.service';
import { Expense } from '../../../model/expense/expense.model';

@Component({
  selector: 'app-expense-info',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ExpenseModalComponent, ToastComponent, ConfirmDialogComponent, TimeElapsedPipe],
  templateUrl: './expense-info.component.html',
  styleUrl: './expense-info.component.css'
})
export class ExpenseInfoComponent implements OnInit {

  expenseUuid !: string;
  expense?: Expense;

  errorMsg = '';
  copied = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';
  showToast = false;

  enteredUuid = '';
  isUuidValid = false;
  private uuidRegex: RegExp = Constant.UUID_REGEX;

  constructor(private router: Router, private route: ActivatedRoute, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.expenseUuid = uuid;
        this.fetchExpenseDetails();
      }
    });
  }

  fetchExpenseDetails() {
    this.expenseService.getExpenseByUuid(this.expenseUuid).subscribe({
      next: (res) => {
        this.expense = res;
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load expense's data!";
      }
    });
  }

  deleteExpense() {
    if (this.expense) {
      this.expenseService.deleteExpenseByUuid(this.expense.uuid).subscribe({
        next: () => {
          this.showToastComponent("warning", "Expense deleted");
          this.router.navigate(['/dashboard/expenses']);
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting expense');
        },
      });
    }
  }

  copyUuid() {
    if (this.expense?.uuid) {
      navigator.clipboard.writeText(this.expense.uuid).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1500);
      });
    }
  }

  expenseSuccess(expense: Expense): void {
    this.showToastComponent("success", "Expense updated.");
    this.fetchExpenseDetails();
  }

  expenseError(errorStr: string): void {
    this.showToastComponent("error", errorStr)
  }

  reload() {
    window.location.reload();
  }

  validateUuid() {
    this.isUuidValid = this.uuidRegex.test(this.enteredUuid.trim());
  }

  navigateWithUuid() {
    if (!this.isUuidValid) return;
    this.router.navigate(['/dashboard/expense', this.enteredUuid.trim()]);
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.enteredUuid = text.trim();
      this.validateUuid();
    } catch {
      alert('Clipboard access denied');
    }
  }

  editExpense(expense?: Expense) { }

  askDeleteExpense(expense?: Expense): void { }

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }

}
