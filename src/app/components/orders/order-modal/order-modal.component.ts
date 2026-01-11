import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';
import { UpdateOrderRequest } from '../../../model/order/update-order-request.model';
import { CustomerService } from '../../../services/customer/customer.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Customer } from '../../../model/customer/customer.model';


@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-modal.component.html',
  styleUrl: './order-modal.component.css'
})
export class OrderModalComponent implements OnInit, OnChanges {

  modalForm !: FormGroup;
  isSubmitting = false;
  showToast = false;
  isEditMode = false;
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  selectedFiles: File[] = [];
  jobTypes: string[] = [
    'BANNER',
    'RECEIT',
    'VISITING_CARD',
    'WEDDING_CARD',
    'COLOR_POSTER',
    'BOOK_BINDING',
    'PAMPLET',
    'BILL_BOOK'
  ];
  isInvalidBookNumbers = false;
  isInvalidAmounts = false;

  @Input() model: Order | null = null;
  @Output() successAction = new EventEmitter<Order>();
  @Output() errorAction = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private service: OrderService, private customerService: CustomerService) { }

  ngOnInit(): void {
    this.initModalForm();
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
      customerName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      jobType: ['', Validators.required],
      count: [1, [Validators.required, Validators.min(1)]],
      dateOfDelivery: ['', [Validators.required, Validators.min(1)]],
      bookNumber: [1, [Validators.min(1)]],
      wBookNumber: [1, [Validators.min(1)]],
      remainingAmount: ['', Validators.required],
      totalAmount: ['', Validators.required],
      depositAmount: ['', Validators.required],
      discountedAmount: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      note: [''],
      description: ['']
    });

    // Listen to customerName changes
    this.customerName?.valueChanges
      .pipe(
        debounceTime(1000), // Wait for 300ms after the user stops typing
        distinctUntilChanged(), // Only emit if the value has changed
        switchMap(name => this.customerService.searchCustomersByName(name)) // Call the service
      ).subscribe({
        next: (customers) => {
          this.customers = customers;
        },
        error: (err) => {
          console.log({ err });
        }
      });
    // .subscribe(customers => {
    //   this.customers = customers;
    // });

    // Calculate remainingAmount dynamically
    this.modalForm.valueChanges.subscribe(values => {
      const { bookNumber, wBookNumber, totalAmount, depositAmount, discountedAmount } = values;
      const remaining = (totalAmount || 0) - (depositAmount || 0) - (discountedAmount || 0);
      if (remaining < 0) {
        this.isInvalidAmounts = true;
      } else {
        this.isInvalidAmounts = false;
        this.modalForm.patchValue({ remainingAmount: remaining }, { emitEvent: false });
      }
      if ((!bookNumber && !wBookNumber) || (bookNumber && wBookNumber)) {
        this.isInvalidBookNumbers = true;
      }
      else {
        this.isInvalidBookNumbers = false;
      }
    });
  }

  get customerName() { return this.modalForm.get('customerName'); }
  get phone() { return this.modalForm.get('phone'); }
  get address() { return this.modalForm.get('address'); }
  get jobType() { return this.modalForm.get('jobType'); }
  get count() { return this.modalForm.get('count'); }
  get dateOfDelivery() { return this.modalForm.get('dateOfDelivery'); }
  get bookNumber() { return this.modalForm.get('bookNumber'); }
  get wBookNumber() { return this.modalForm.get('wBookNumber'); }
  get remainingAmount() { return this.modalForm.get('remainingAmount'); }
  get totalAmount() { return this.modalForm.get('totalAmount'); }
  get depositAmount() { return this.modalForm.get('depositAmount'); }
  get discountedAmount() { return this.modalForm.get('discountedAmount'); }
  get paymentStatus() { return this.modalForm.get('paymentStatus'); }
  get note() { return this.modalForm.get('note'); }
  get description() { return this.modalForm.get('description'); }

  onCustomerSelect(customer: Customer): void {
    this.selectedCustomer = customer;
    this.updateCustomerFields(customer);
  }

  updateCustomerFields(customer: Customer): void {
    this.modalForm.patchValue({
      phone: customer.primaryPhoneNumber,
      address: customer.address
    });
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);
    event.target.value = ''; // reset input
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  incrementCount() {
    const currentCount = this.count?.value || 0;
    this.modalForm.patchValue({ count: currentCount + 1 });
  }

  decrementCount() {
    const currentCount = this.count?.value || 0;
    if (currentCount > 1) {
      this.modalForm.patchValue({ count: currentCount - 1 });
    }
  }

  programmaticallyClickFormSubmitButton(): void {
    (document.querySelector('#orderModalFormSubmitButton') as HTMLElement)?.click();
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
    let newEntity: UpdateOrderRequest = {
      id: this.model?.id,
      ...this.modalForm.value
    };
    this.service.updateOrder(newEntity).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while updating order details.';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  addEntity(): void {
    this.isSubmitting = true;
    const formData = new FormData();
    Object.entries(this.modalForm.value).forEach(([key, value]) => formData.append(key, value as string));
    this.selectedFiles.forEach(file => formData.append('attachments', file));
    this.service.createOrder(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.modalForm.reset();
        this.closeModalProgramatically();
        if (this.successAction != null)
          this.successAction.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMessage = err?.error?.message || 'Error occured while adding order.';
        this.closeModalProgramatically();
        if (this.errorAction != null)
          this.errorAction.emit(errorMessage);
      }
    });
  }

  closeModalProgramatically(): void {
    (document.querySelector('#orderModalCloseBtn') as HTMLElement)?.click();
  }
}
