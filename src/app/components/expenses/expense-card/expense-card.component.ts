import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LedgerEntry } from '../../../model/ledger/ledger-entry.model';
import { TimeElapsedPipe } from "../../../pipes/timeElapsed/time-elapsed.pipe";

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [CommonModule, TimeElapsedPipe],
  templateUrl: './expense-card.component.html',
  styleUrl: './expense-card.component.css'
})
export class ExpenseCardComponent {
  @Input() ledgerEntry?: LedgerEntry;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
}
