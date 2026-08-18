import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LedgerService } from '../../services/ledger/ledger.service';
import { LedgerEntry } from '../../model/ledger/ledger-entry.model';
import { ToastComponent } from "../utility/toast/toast.component";
import { Router } from '@angular/router';
import { _toLeftRightCenter } from 'chart.js/helpers';
import { TimeElapsedPipe } from "../../pipes/timeElapsed/time-elapsed.pipe";

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

  constructor(
    private router: Router,
    private ledgerService: LedgerService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.ledgerService.getAllExpenses().subscribe({
      next: (res) => {
        this.ledgerEntries = res;
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
    this.loadData();
  }

  get totalCredit() {
    return this.ledgerEntries
      .filter(t => t.ledgerType === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalDebit() {
    return this.ledgerEntries
      .filter(t => t.ledgerType === 'DEBIT')
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
    if (ledger.ledgerSource === 'ORDER' && ledger.printJobUuid) {
      this.router.navigate(['/dashboard/order', ledger.printJobUuid]);
    }
    else if ((ledger.ledgerSource === 'PURCHASE' || ledger.ledgerSource === 'PERSONAL') && ledger.expenseUuid) {
      this.router.navigate(['/dashboard/expense', ledger.expenseUuid]);
    }
    else if (ledger.ledgerSource === 'INVESTMENT' && ledger.investmentUuid) {
      this.router.navigate(['/dashboard/investment', ledger.investmentUuid]);
    }
  }
}
