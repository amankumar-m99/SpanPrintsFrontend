import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Expense } from '../../../model/expense/expense.model';
import { ExpenseService } from '../../../services/expense/expense.service';

@Component({
  selector: 'app-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './expense-modal.component.html',
  styleUrl: './expense-modal.component.css'
})
export class ExpenseModalComponent implements OnInit, OnChanges {

  modalForm!: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: Expense | null = null;
  @Output() successAction = new EventEmitter<Expense>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: ExpenseService) { }
  ngOnInit(): void {
    this.modalForm = this.fb.group({
      expenseType: ['BUSINESS', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      dateOfExpense: ['', Validators.required],
      description: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.model != null) {
      this.isEditMode = true;
      this.modalForm.patchValue(this.model);
    } else {
      this.isEditMode = false;
      this.modalForm.reset();
    }
  }

  submitForm(): void {
    if (this.modalForm.invalid) {
      this.modalForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.editEntity();
    }
    else {
      this.addEntity();
    }
  }

  addEntity(): void {
    this.isSubmitting = true;
    let newModel: Expense = {
      uuid: crypto.randomUUID(),
      createdAt: new Date(),
      ...this.modalForm.value
    };
    this.service.addExpense(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error while adding expense.';
        console.log(errorMessage);
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  editEntity(): void {
    this.isSubmitting = true;
    let newModel: Expense = {
      uuid: this.model?.uuid,
      createdAt: new Date(),
      ...this.modalForm.value
    };
    this.service.updateExpense(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error while adding expense.';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#expenseModalCloseBtn') as HTMLElement)?.click();
  }

  get expenseType() { return this.modalForm.get('expenseType'); }
  get amount() { return this.modalForm.get('amount'); }
  get dateOfExpense() { return this.modalForm.get('dateOfExpense'); }
  get description() { return this.modalForm.get('description'); }

}
