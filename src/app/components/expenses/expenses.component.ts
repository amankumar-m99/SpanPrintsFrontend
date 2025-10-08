import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ExpenseCardComponent } from '../expense-card/expense-card.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ExpenseCardComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})

export class ExpensesComponent implements OnInit {
  expenses: any[] = [];
  expenseForm!: FormGroup;
  isSubmitting = false;
  editIndex: number | null = null;
  filteredOrders: any[] = [];   // filtered & sorted list
  filterStatus: string = '';    // holds dropdown value
  sortBy: string = 'createdAt_desc';
  searchTerm: string = '';
  activeFiltersCount = 0;
  activeFiltersSummary = '';

  @Output() save = new EventEmitter<any>();

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
    this.applyFilters();
  }

  applyFilters() {
    let data = [...this.expenses];

    // 🔍 Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.customerName.toLowerCase().includes(term) ||
        o.phone.includes(term)
      );
    }

    // 📌 Status filter
    if (this.filterStatus) {
      data = data.filter(o => o.paymentStatus === this.filterStatus);
    }

    // ↕ Sorting
    switch (this.sortBy) {
      case 'createdAt_desc':
        data.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case 'createdAt_asc':
        data.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case 'amount_desc':
        data.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case 'amount_asc':
        data.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
    }

    this.activeFiltersCount = 0;
    let summaries: string[] = [];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.activeFiltersCount++;
      summaries.push(`Search: "${this.searchTerm}"`);
    }

    if (this.filterStatus && this.filterStatus !== '') {
      this.activeFiltersCount++;
      summaries.push(`Status: ${this.filterStatus}`);
    }

    if (this.sortBy && this.sortBy !== 'createdAt_desc') {
      this.activeFiltersCount++;
      let label = '';
      switch (this.sortBy) {
        case 'createdAt_asc': label = 'Oldest First'; break;
        case 'amount_desc': label = 'Amount High→Low'; break;
        case 'amount_asc': label = 'Amount Low→High'; break;
      }
      summaries.push(`Sort: ${label}`);
    }

    this.activeFiltersSummary = summaries.join(', ');
    this.filteredOrders = data;
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = '';
    this.sortBy = 'createdAt_desc';
    this.applyFilters(); // reset filters count
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

  onSubmit() {
    if (this.expenseForm.valid) {
      this.save.emit(this.expenseForm.value);
      this.expenseForm.reset({ type: 'Business' });
    }
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
