import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Expense } from '../../../model/expense/expense.model';
import { ExpenseService } from '../../../services/expense/expense.service';
import { UpdateExpenseRequest } from '../../../model/expense/update-expense-request.model';
import { CreateExpenseRequest } from '../../../model/expense/create-expense-request.model';

@Component({
  selector: 'app-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './expense-modal.component.html',
  styleUrl: './expense-modal.component.css'
})
export class ExpenseModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: Expense | null = null;
  @Output() successAction = new EventEmitter<Expense>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: ExpenseService) { }

  ngOnInit(): void {
    if (!this.modalForm) {
      this.initModalForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.modalForm) {
      this.initModalForm();
    }
    if (this.model != null) {
      this.isEditMode = true;
      this.modalForm?.patchValue(this.model);
    } else {
      this.isEditMode = false;
      this.modalForm?.reset();
    }
  }

  initModalForm(): void {
    this.modalForm = this.fb.group({
      expenseType: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      dateOfExpense: ['', Validators.required],
      description: ['']
    });
  }

  get expenseType() { return this.modalForm.get('expenseType'); }
  get amount() { return this.modalForm.get('amount'); }
  get dateOfExpense() { return this.modalForm.get('dateOfExpense'); }
  get description() { return this.modalForm.get('description'); }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#expenseModalFormSubmitButton') as HTMLElement)?.click();
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

  editEntity(): void {
    this.isSubmitting = true;
    let newModel: UpdateExpenseRequest = {
      ...this.modalForm.value
    };
    if (this.model?.id) {
      this.service.updateExpense(this.model.id, newModel).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.modalForm.reset();
          this.closeModalProgramatically();
          if (this.successAction != null)
            this.successAction.emit({ ...response });
        },
        error: (err) => {
          this.isSubmitting = false;
          let errorMessage = err?.error?.message || 'Error occured while updating expense details';
          this.closeModalProgramatically();
          if (this.errorAction != null)
            this.errorAction.emit(errorMessage);
        }
      });
    }
  }

  addEntity(): void {
    this.isSubmitting = true;
    let newModel: CreateExpenseRequest = {
      ...this.modalForm.value
    };
    this.service.createExpense(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while adding expense';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#expenseModalCloseBtn') as HTMLElement)?.click();
  }
}
