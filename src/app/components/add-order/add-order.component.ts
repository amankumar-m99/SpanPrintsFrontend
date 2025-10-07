import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.css'
})

export class AddOrderComponent implements OnInit {
  orders: any[] = [];           // original list from backend
  orderForm!: FormGroup;
  isSubmitting = false;
  editIndex: number | null = null; // Track editing order index
  filteredOrders: any[] = [];   // filtered & sorted list
  filterStatus: string = '';    // holds dropdown value
  sortBy: string = 'createdAt_desc';
  searchTerm: string = '';
  activeFiltersCount = 0;
  activeFiltersSummary = '';

  selectedFiles: File[] = [];

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);
    event.target.value = ''; // reset input
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }


  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = '';
    this.sortBy = 'createdAt_desc';
    this.applyFilters(); // reset filters count
  }


  jobTypes = [
    'banner', 'receipt', 'visiting card', 'bill book',
    'wedding card', 'color poster', 'book binding', 'pamplet'
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      jobType: ['', Validators.required],
      count: [1, [Validators.required, Validators.min(1)]],
      dateOfDelivery: ['', [Validators.required, Validators.min(1)]],
      bookNumber: [1, [Validators.required, Validators.min(1)]],
      wBookNumber: [1, [Validators.required, Validators.min(1)]],
      remainingAmount: ['', Validators.required],
      totalAmount: ['', Validators.required],
      depositAmount: ['', Validators.required],
      discountedAmount: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      note: [''],
      description: ['']
    });
    this.loadOrders();
  }

  loadOrders() {
    // Replace with API call
    this.orders = [
      {
        id: '25101121',
        customerName: 'Rahul',
        phone: '8566953776',
        address: 'Noida',
        jobType: 'Visiting Card',
        count: 200,
        dateOfDelivery: new Date(),
        bookNumber: 22,
        wBookNumber: 22,
        totalAmount: 100,
        remainingAmount: 0,
        depositAmount: 12,
        discountedAmount: 0,
        paymentStatus: 'partially paid',
        createdAt: new Date()
      },
      {
        id: '25101121',
        customerName: 'AmanK',
        phone: '8566953776',
        address: 'Noida',
        jobType: 'Visiting Card',
        count: 200,
        dateOfDelivery: new Date(),
        bookNumber: 22,
        wBookNumber: 22,
        totalAmount: 100,
        remainingAmount: 0,
        depositAmount: 12,
        discountedAmount: 0,
        paymentStatus: 'paid',
        createdAt: new Date()
      },
      {
        id: '25101121',
        customerName: 'AmanK',
        phone: '8566953776',
        address: 'Noida',
        jobType: 'Visiting Card',
        count: 200,
        dateOfDelivery: new Date(),
        bookNumber: 22,
        wBookNumber: 22,
        totalAmount: 100,
        remainingAmount: 0,
        depositAmount: 12,
        discountedAmount: 0,
        paymentStatus: 'unpaid',
        createdAt: new Date()
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    let data = [...this.orders];

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

  submitOrderNew(): void {
    if (this.orderForm.invalid) return;

    this.isSubmitting = true;
    const formData = new FormData();
    Object.entries(this.orderForm.value).forEach(([key, value]) => formData.append(key, value as string));
    this.selectedFiles.forEach(file => formData.append('attachments', file));

    // Call your API with formData
  }

  submitOrder() {
    if (this.orderForm.invalid) return;
    this.isSubmitting = true;

    setTimeout(() => {
      if (this.editIndex !== null) {
        // Update existing order
        this.orders[this.editIndex] = {
          ...this.orderForm.value,
          createdAt: this.orders[this.editIndex].createdAt
        };
      } else {
        // Add new order
        this.orders.push({
          ...this.orderForm.value,
          createdAt: new Date()
        });
      }

      this.isSubmitting = false;
      this.orderForm.reset();
      this.editIndex = null;

      // Close modal programmatically
      (document.querySelector('#newOrderModal .btn-close') as HTMLElement)?.click();
    }, 1500);
  }

  editOrder(order: any, index: number) {
    this.editIndex = index;
    this.orderForm.patchValue(order);
    const modal = document.getElementById('newOrderModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  deleteOrder(index: number) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orders.splice(index, 1);
    }
  }
}
