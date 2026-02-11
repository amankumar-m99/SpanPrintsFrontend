import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionCardComponent } from '../transaction-card/transaction-card.component';
import { LedgerService } from '../../services/ledger/ledger.service';
import { LedgerEntry } from '../../model/ledger/ledger-entry.model';
import { ToastComponent } from "../utility/toast/toast.component";

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionCardComponent, ToastComponent],
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.css']
})
export class LedgerComponent implements OnInit {

  ledgerEntries: LedgerEntry[] = [];

  activeFiltersCount = 0;
  activeFiltersSummary = '';
  isRefreshingData = false;
  // Filters
  filters = {
    timePeriod: 'thisMonth',
    type: 'all',
    domain: 'all'
  };

  toastType = 'info';
  toastMsg = '';
  showToast = false;

  constructor(private ledgerService: LedgerService) { }

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

  get filteredTransactions() {
    return this.ledgerEntries.filter(t => {
      const typeOk = this.filters.type === 'all' || t.ledgerType === this.filters.type;
      return typeOk;
    });
  }

  // Simulate time-period filtering logic
  filterByTimePeriod(date: Date): boolean {
    const now = new Date();
    const d = new Date(date);
    switch (this.filters.timePeriod) {
      case 'today':
        return d.toDateString() === now.toDateString();
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return d >= startOfWeek;
      case 'thisMonth':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case 'thisYear':
        return d.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  }

  get totalCredit() {
    return this.filteredTransactions
      .filter(t => t.ledgerType === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalDebit() {
    return this.filteredTransactions
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
}
