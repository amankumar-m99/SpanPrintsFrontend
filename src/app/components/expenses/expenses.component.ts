import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Expense } from '../../model/expense.model';
import { ExpenseService } from '../../services/expense/expense.service';
import { ExpenseCardComponent } from './expense-card/expense-card.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ExpenseCardComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})

export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  expenseForm!: FormGroup;
  isSubmitting = false;
  editIndex: number | null = null;
  filteredOrders: any[] = [];   // filtered & sorted list
  filterStatus: string = '';    // holds dropdown value
  sortBy: string = 'createdAt_desc';
  searchTerm: string = '';
  activeFiltersCount = 0;
  activeFiltersSummary = '';
  viewType = "card";
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;

  @Output() save = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.expenseForm = this.fb.group({
      expenseType: ['Business', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      dateOfExpense: ['', Validators.required],
      description: ['']
    });
    this.loadExpenses();
  }

  loadExpenses() {
    // Replace with API call
    this.expenseService.getAllExpenses().subscribe({
      next: (res) => {
        this.expenses = res;
        this.applyFilters();
      },
      error: () => { },
    });
  }

  applyFilters() {
    let data = [...this.expenses];

    // 🔍 Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.description.toLowerCase().includes(term) ||
        o.amount.toString().includes(term)
      );
    }

    // 📌 Status filter
    if (this.filterStatus) {
      data = data.filter(o => o.expenseType === this.filterStatus);
    }

    // ↕ Sorting
    switch (this.sortBy) {
      case 'createdAt_desc':
        data.sort((a, b) => +new Date(b.dateOfExpense) - +new Date(a.dateOfExpense));
        break;
      case 'createdAt_asc':
        data.sort((a, b) => +new Date(a.dateOfExpense) - +new Date(b.dateOfExpense));
        break;
      case 'amount_desc':
        data.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        data.sort((a, b) => a.amount - b.amount);
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

    this.expenseService.addExpense(this.expenseForm.value).subscribe({
      next: () => {
        if (this.editIndex !== null) {
          // Update expense
          this.expenses[this.editIndex] = { ...this.expenseForm.value };
        } else {
          // Add new expense
          this.expenses.push({ ...this.expenseForm.value });
        }
        this.isSubmitting = false;
        this.showSuccessToast = true;
        this.expenseForm.reset();
        this.editIndex = null;
        (document.querySelector('#expenseModal .btn-close') as HTMLElement)?.click();
        setTimeout(() => this.showSuccessToast = false, 3000);
      },
      error: (err) => {
        console.log(err);
        this.isSubmitting = false;
        this.showErrorToast = true;
        setTimeout(() => this.showErrorToast = false, 3000);
      }
    });
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

  changeViewType(type: string): void {
    this.viewType = type;
  }
}
