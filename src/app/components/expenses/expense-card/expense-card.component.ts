import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeElapsedPipe } from "../../../pipes/timeElapsed/time-elapsed.pipe";
import { Expense } from '../../../model/expense/expense.model';

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [CommonModule, TimeElapsedPipe],
  templateUrl: './expense-card.component.html',
  styleUrl: './expense-card.component.css'
})
export class ExpenseCardComponent {
  @Input() expense?: Expense;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
}
