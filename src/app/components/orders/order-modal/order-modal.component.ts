import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Order } from '../../../model/order/order.model';
import { UpdateOrderRequest } from '../../../model/order/update-order-request.model';
import { Customer } from '../../../model/customer/customer.model';
import { OrderService } from '../../../services/order/order.service';
import { CustomerService } from '../../../services/customer/customer.service';
import { PrintJobType } from '../../../model/order/printjobtype.model';
import { PrintJobTypeService } from '../../../services/order/printjobtype.service';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-modal.component.html',
  styleUrl: './order-modal.component.css'
})
export class OrderModalComponent implements OnInit, OnChanges {

  /* -------------------- FORM -------------------- */
  modalForm!: FormGroup;

  /* -------------------- STATE -------------------- */
  isEditMode = false;
  isSubmitting = false;

  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  isCustomerSearchLoading = false;

  isPrintJobTypesSearchLoading = false;

  selectedFiles: File[] = [];

  isInvalidBookNumbers = false;
  isInvalidAmounts = false;

  printJobTypes: PrintJobType[] = [];

  /* -------------------- INPUT / OUTPUT -------------------- */
  @Input() model: Order | null = null;

  @Output() successAction = new EventEmitter<Order>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private customerService: CustomerService,
    private printJobTypeService: PrintJobTypeService
  ) { }

  /* =========================================================
     LIFECYCLE
     ========================================================= */

  ngOnInit(): void {
    this.buildForm();
    this.setupCustomerSearch();
    this.setupDerivedCalculations();
    this.loadPrintJobTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['model'] || !this.modalForm) {
      return;
    }

    if (this.model) {
      this.enterEditMode(this.model);
    } else {
      this.enterAddMode();
    }
  }

  /* =========================================================
     FORM SETUP
     ========================================================= */

  private buildForm(): void {
    this.modalForm = this.fb.group({
      customerId: [{ value: '', disabled: true }, Validators.required],
      customerName: ['', Validators.required],
      phone: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: [{ value: '', disabled: true }, Validators.required],

      printJobTypeId: ['', Validators.required],
      count: [1, [Validators.required, Validators.min(1)]],
      dateOfDelivery: ['', Validators.required],

      bookNumber: [null],
      wBookNumber: [null],

      totalAmount: ['', Validators.required],
      depositAmount: ['', Validators.required],
      discountedAmount: ['', Validators.required],
      pendingAmount: [{ value: '', disabled: true }, Validators.required],

      paymentStatus: ['', Validators.required],
      note: [''],
      description: ['']
    });
  }
  get customerId() { return this.modalForm.get('customerId'); }
  get customerName() { return this.modalForm.get('customerName'); }
  get phone() { return this.modalForm.get('phone'); }
  get address() { return this.modalForm.get('address'); }
  get printJobTypeId() { return this.modalForm.get('printJobTypeId'); }
  get count() { return this.modalForm.get('count'); }
  get dateOfDelivery() { return this.modalForm.get('dateOfDelivery'); }
  get bookNumber() { return this.modalForm.get('bookNumber'); }
  get wBookNumber() { return this.modalForm.get('wBookNumber'); }
  get totalAmount() { return this.modalForm.get('totalAmount'); }
  get depositAmount() { return this.modalForm.get('depositAmount'); }
  get discountedAmount() { return this.modalForm.get('discountedAmount'); }
  get pendingAmount() { return this.modalForm.get('pendingAmount'); }
  get paymentStatus() { return this.modalForm.get('paymentStatus'); }
  get note() { return this.modalForm.get('note'); }
  get description() { return this.modalForm.get('description'); }

  onJobTypeDropdownOpen(): void {
    this.loadPrintJobTypes();
  }

  private loadPrintJobTypes() {
    this.isPrintJobTypesSearchLoading = true;
    this.printJobTypeService.getAllPrintJobTypes().subscribe({
      next: (res) => {
        this.printJobTypes = res;
        this.isPrintJobTypesSearchLoading = false;
      },
      error: (err) => {
        this.isPrintJobTypesSearchLoading = false;
      }
    });
  }

  /* =========================================================
     CUSTOMER SEARCH
     ========================================================= */

  private setupCustomerSearch(): void {
    this.customerName!.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || typeof value !== 'string') {
          this.customers = [];
          this.isCustomerSearchLoading = false;
          return of([]);
        }

        if (this.selectedCustomer && value === this.selectedCustomer.name) {
          this.customers = [];
          this.isCustomerSearchLoading = false;
          return of([]);
        }

        this.isCustomerSearchLoading = true;
        this.customers = [];

        return this.customerService.searchCustomersByName(value);
      })
    ).subscribe({
      next: customers => {
        this.customers = customers;
        this.isCustomerSearchLoading = false;
      },
      error: () => {
        this.isCustomerSearchLoading = false;
        this.customers = [];
      }
    });
  }

  onCustomerSelect(customer: Customer): void {
    this.selectedCustomer = customer;
    this.modalForm.patchValue(
      {
        customerId: customer.id,
        customerName: customer.name,
        phone: customer.primaryPhoneNumber,
        address: customer.address
      },
      { emitEvent: false }
    );

    this.customers = [];
  }

  /* =========================================================
     DERIVED FIELDS
     ========================================================= */

  private setupDerivedCalculations(): void {
    this.modalForm.valueChanges.subscribe(values => {
      this.calculatePendingAmount(values);
      this.validateBookNumbers(values);
    });
  }

  private calculatePendingAmount(values: any): void {
    const total = +values.totalAmount || 0;
    const deposit = +values.depositAmount || 0;
    const discount = +values.discountedAmount || 0;

    const pending = total - deposit - discount;

    this.isInvalidAmounts = pending < 0;

    if (!this.isInvalidAmounts) {
      this.modalForm.patchValue(
        { pendingAmount: pending },
        { emitEvent: false }
      );
    }
  }

  private validateBookNumbers(values: any): void {
    const hasBook = !!values.bookNumber;
    const hasWBook = !!values.wBookNumber;

    this.isInvalidBookNumbers = (hasBook && hasWBook) || (!hasBook && !hasWBook);
  }

  incrementCount() {
    const currentCount = this.count?.value || 0;
    this.modalForm.patchValue({ count: currentCount + 1 }, { emitEvent: false });
  }

  decrementCount() {
    const currentCount = this.count?.value || 0;
    if (currentCount > 1) {
      this.modalForm.patchValue({ count: currentCount - 1 }, { emitEvent: false });
    }
  }

  /* =========================================================
     MODE HANDLING
     ========================================================= */

  private enterEditMode(order: Order): void {
    this.isEditMode = true;
    this.selectedCustomer = null;

    this.modalForm.reset({}, { emitEvent: false });
    this.modalForm.patchValue(order, { emitEvent: false });
  }

  private enterAddMode(): void {
    this.isEditMode = false;
    this.selectedCustomer = null;
    this.selectedFiles = [];

    this.modalForm.reset(
      {
        count: 1
      },
      { emitEvent: false }
    );
  }

  /* =========================================================
     FILE HANDLING
     ========================================================= */

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  /* =========================================================
     SUBMIT
     ========================================================= */

  submitForm(): void {
    if (this.modalForm.invalid || this.isInvalidAmounts || this.isInvalidBookNumbers) {
      this.modalForm.markAllAsTouched();
      return;
    }

    this.isEditMode ? this.updateOrder() : this.createOrder();
  }

  private updateOrder(): void {
    this.isSubmitting = true;
    const payload: UpdateOrderRequest = {
      ...this.modalForm.getRawValue()
    };
    if (this.model?.id) {
      this.orderService.updateOrder(this.model.id, payload).subscribe({
        next: res => {
          this.isSubmitting = false;
          this.closeModal();
          this.successAction.emit(res);
        },
        error: err => {
          this.isSubmitting = false;
          this.closeModal();
          this.errorAction.emit(err?.error?.message || 'Error updating order');
        }
      });
    }
  }

  private createOrder(): void {
    this.isSubmitting = true;

    const formData = new FormData();
    // Object.entries(this.modalForm.getRawValue()).forEach(
    //   ([key, value]) => formData.append(key, value as any)
    // );

    Object.entries(this.modalForm.getRawValue()).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });

    this.selectedFiles.forEach(file =>
      formData.append('attachments', file)
    );

    this.orderService.createOrder(formData).subscribe({
      next: res => {
        this.isSubmitting = false;
        this.closeModal();
        this.successAction.emit(res);
      },
      error: err => {
        this.isSubmitting = false;
        this.closeModal();
        this.errorAction.emit(err?.error?.message || 'Error creating order');
      }
    });
  }

  /* =========================================================
     UTIL
     ========================================================= */

  private closeModal(): void {
    (document.querySelector('#orderModalCloseBtn') as HTMLElement)?.click();
  }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#orderModalFormSubmitButton') as HTMLElement)?.click();
  }

  /* =========================================================
     GETTERS
     ========================================================= */
}
