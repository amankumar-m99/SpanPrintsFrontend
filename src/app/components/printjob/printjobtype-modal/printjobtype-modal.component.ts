import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrintJobType } from '../../../model/order/printjobtype.model';
import { UpdatePrintJobTypeRequest } from '../../../model/order/update-printjobtype-request.model';
import { CreatePrintJobTypeRequest } from '../../../model/order/create-printjobtype-request.model';
import { CommonModule } from '@angular/common';
import { PrintJobTypeService } from '../../../services/order/printjobtype.service';

@Component({
  selector: 'app-printjobtype-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './printjobtype-modal.component.html',
  styleUrl: './printjobtype-modal.component.css'
})
export class PrintjobtypeModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: PrintJobType | null = null;
  @Output() successAction = new EventEmitter<PrintJobType>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: PrintJobTypeService) { }

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
      name: ['', Validators.required],
      description: [''],
    });
  }

  get name() { return this.modalForm.get('name'); }
  get description() { return this.modalForm.get('description'); }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#printJobTypeModalFormSubmitButton') as HTMLElement)?.click();
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
    let newModel: UpdatePrintJobTypeRequest = {
      id: this.model?.id,
      ...this.modalForm.value
    };
    this.service.updatePrintJobType(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while updating print-job details';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  addEntity(): void {
    this.isSubmitting = true;
    let newModel: CreatePrintJobTypeRequest = {
      ...this.modalForm.value
    };
    this.service.createPrintJobType(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while adding print-job';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#printJobTypeModalCloseBtn') as HTMLElement)?.click();
  }

}
