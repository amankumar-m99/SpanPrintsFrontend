import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CreateInvestmentRequest } from '../../../model/investment/create-investment-request.model';
import { Investment } from '../../../model/investment/investment.model';
import { UpdateInvestmentRequest } from '../../../model/investment/update-investment-request.model';
import { InvestmentService } from '../../../services/investment/investment.service';

@Component({
  selector: 'app-investment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './investment-modal.component.html',
  styleUrl: './investment-modal.component.css'
})
export class InvestmentModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: Investment | null | undefined = null;
  @Output() successAction = new EventEmitter<Investment>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: InvestmentService) { }

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
      amount: ['', [Validators.required, Validators.min(1)]],
      dateOfInvestment: ['', Validators.required],
      description: ['']
    });
  }

  get amount() { return this.modalForm.get('amount'); }
  get dateOfInvestment() { return this.modalForm.get('dateOfInvestment'); }
  get description() { return this.modalForm.get('description'); }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#investmentModalFormSubmitButton') as HTMLElement)?.click();
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
    let newModel: UpdateInvestmentRequest = {
      ...this.modalForm.value
    };
    if (this.model?.uuid) {
      newModel.uuid = this.model?.uuid;
      this.service.updateInvestment(newModel).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.modalForm.reset();
          this.closeModalProgramatically();
          if (this.successAction != null)
            this.successAction.emit({ ...response });
        },
        error: (err) => {
          this.isSubmitting = false;
          let errorMessage = err?.error?.message || 'Error occured while updating investment details';
          this.closeModalProgramatically();
          if (this.errorAction != null)
            this.errorAction.emit(errorMessage);
        }
      });
    }
  }

  addEntity(): void {
    this.isSubmitting = true;
    let newModel: CreateInvestmentRequest = {
      ...this.modalForm.value
    };
    this.service.createInvestment(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while adding investment';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#investmentModalCloseBtn') as HTMLElement)?.click();
  }
}
