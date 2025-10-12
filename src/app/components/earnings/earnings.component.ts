import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionCardComponent } from '../transaction-card/transaction-card.component';
import { Transaction } from '../../model/transaction.model';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionCardComponent],
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.css']
})
export class EarningsComponent {

  transactions: Transaction[] = [];
  constructor() {
    this.transactions = [];
    this.transactions.push({ id: 1, amount: 100, transactionType: "CREDIT", transactionDomain: "JOB", transactionDate: new Date(), transactionTime: new Date(), expenseId: -1, printJobId: 2 });
    this.transactions.push({ id: 2, amount: 200, transactionType: "DEBIT", transactionDomain: "EXXPENSE", transactionDate: new Date(), transactionTime: new Date(), expenseId: 1, printJobId: -1 });
  }

  // Filters
  filters = {
    timePeriod: 'thisMonth',
    type: 'all',
    domain: 'all'
  };

  get filteredTransactions() {
    return this.transactions.filter(t => {
      const typeOk = this.filters.type === 'all' || t.transactionType === this.filters.type;
      const domainOk = this.filters.domain === 'all' || t.transactionDomain === this.filters.domain;
      const timeOk = this.filterByTimePeriod(t.transactionDate);
      return typeOk && domainOk && timeOk;
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
      .filter(t => t.transactionType === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalDebit() {
    return this.filteredTransactions
      .filter(t => t.transactionType === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get netEarnings() {
    return this.totalCredit - this.totalDebit;
  }
}
