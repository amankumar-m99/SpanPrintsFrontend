import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../model/transaction/transaction.model';

@Component({
  selector: 'app-transaction-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-card.component.html',
  styleUrls: ['./transaction-card.component.css']
})

export class TransactionCardComponent {
  @Input() transaction?: Transaction;
}
