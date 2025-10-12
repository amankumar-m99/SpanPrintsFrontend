import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionCardComponent } from '../transaction-card/transaction-card.component';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionCardComponent],
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.css']
})
export class EarningsComponent {
  transactions = [
    { id: 1, domain: 'job', type: 'credit', amount: 1200, date: new Date(), description: 'Order #1012' },
    { id: 2, domain: 'expense', type: 'debit', amount: 400, date: new Date(), description: 'Paper stock' },
    { id: 3, domain: 'job', type: 'credit', amount: 500, date: new Date(), description: 'Banner printing' },
    { id: 4, domain: 'expense', type: 'debit', amount: 200, date: new Date(), description: 'Maintenance' },
  ];

  // Filters
  filters = {
    timePeriod: 'thisMonth',
    type: 'all',
    domain: 'all'
  };

  get filteredTransactions() {
    return this.transactions.filter(t => {
      const typeOk = this.filters.type === 'all' || t.type === this.filters.type;
      const domainOk = this.filters.domain === 'all' || t.domain === this.filters.domain;
      const timeOk = this.filterByTimePeriod(t.date);
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
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalDebit() {
    return this.filteredTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get netEarnings() {
    return this.totalCredit - this.totalDebit;
  }
}
