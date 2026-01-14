import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InventoryItem } from '../../../model/inventory/inventory-item/inventory-item.model';
import { InventoryService } from '../../../services/inventory/inventory.service';
import { CreateInventoryItemRequest } from '../../../model/inventory/inventory-item/create-inventory-item-request.model';
import { UpdateInventoryItemRequest } from '../../../model/inventory/inventory-item/update-inventory-item-request.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory-item-modal.component.html',
  styleUrl: './inventory-item-modal.component.css'
})
export class InventoryItemModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;

  @Input() model: InventoryItem | null = null;
  @Output() successAction = new EventEmitter<InventoryItem>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: InventoryService) { }

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
      rate: ['', Validators.required],
      description: [''],
    });
  }

  get name() { return this.modalForm.get('name'); }
  get rate() { return this.modalForm.get('rate'); }
  get description() { return this.modalForm.get('description'); }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#inventoryItemModalFormSubmitButton') as HTMLElement)?.click();
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
    let newModel: UpdateInventoryItemRequest = {
      id: this.model?.id,
      ...this.modalForm.value
    };
    this.service.updateInventoryItem(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while updating inventory-item details';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  addEntity(): void {
    this.isSubmitting = true;
    let newModel: CreateInventoryItemRequest = {
      ...this.modalForm.value
    };
    this.service.createInventoryItem(newModel).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit({ ...response });
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while adding inventory-item';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#inventoryItemModalCloseBtn') as HTMLElement)?.click();
  }
}
