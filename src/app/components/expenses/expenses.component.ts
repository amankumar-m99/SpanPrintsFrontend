import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})

export class ExpensesComponent implements OnInit {
  expenses: any[] = [];
  expenseForm!: FormGroup;
  isSubmitting = false;
  editIndex: number | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.expenseForm = this.fb.group({
      type: ['Business', Validators.required],
      date: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required]
    });

    this.loadExpenses();
  }

  loadExpenses() {
    // Replace with API call
    this.expenses = [
      {
        type: 'Business',
        date: new Date(),
        amount: 1500,
        description: 'Printing materials'
      },
      {
        type: 'Personal',
        date: new Date(),
        amount: 800,
        description: 'Lunch with client'
      }
    ];
  }

  submitExpense() {
    if (this.expenseForm.invalid) return;
    this.isSubmitting = true;

    setTimeout(() => {
      if (this.editIndex !== null) {
        // Update expense
        this.expenses[this.editIndex] = { ...this.expenseForm.value };
      } else {
        // Add new expense
        this.expenses.push({ ...this.expenseForm.value });
      }

      this.isSubmitting = false;
      this.expenseForm.reset({ type: 'Business' });
      this.editIndex = null;

      (document.querySelector('#expenseModal .btn-close') as HTMLElement)?.click();
    }, 1500);
  }

  editExpense(expense: any, index: number) {
    this.editIndex = index;
    this.expenseForm.patchValue(expense);
    const modal = document.getElementById('expenseModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  deleteExpense(index: number) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenses.splice(index, 1);
    }
  }
}
