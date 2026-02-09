import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionCardComponent } from '../transaction-card/transaction-card.component';
import { LedgerService } from '../../services/ledger/ledger.service';
import { Expense } from '../../model/expense/expense.model';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionCardComponent],
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.css']
})
export class LedgerComponent implements OnInit {

  transactions: Expense[] = [];

  // Filters
  filters = {
    timePeriod: 'thisMonth',
    type: 'all',
    domain: 'all'
  };

  constructor(private ledgerService: LedgerService) { }

  ngOnInit(): void {
    this.ledgerService.getAllExpenses().subscribe({
      next: (res) => {
        this.transactions = res;
      },
      error: () => { },
    });
  }

  get filteredTransactions() {
    return this.transactions.filter(t => {
      const typeOk = this.filters.type === 'all' || t.expenseType === this.filters.type;
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
      .filter(t => t.expenseType === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalDebit() {
    return this.filteredTransactions
      .filter(t => t.expenseType === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get netEarnings() {
    return this.totalCredit - this.totalDebit;
  }
}
