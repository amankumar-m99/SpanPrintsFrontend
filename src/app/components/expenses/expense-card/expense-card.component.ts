import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LedgerEntry } from '../../../model/ledger/ledger-entry.model';

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-card.component.html',
  styleUrl: './expense-card.component.css'
})
export class ExpenseCardComponent {
  @Input() ledgerEntry?: LedgerEntry;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
}
