import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InventoryItem } from '../../model/inventory/inventory-item/inventory-item.model';
import { InventoryService } from '../../services/inventory/inventory.service';
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";
import { InventoryItemModalComponent } from "./inventory-item-modal/inventory-item-modal.component";
import { ToastComponent } from "../utility/toast/toast.component";
import { RouterLink } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VendorService } from '../../services/vendor/vendor.service';
import { Vendor } from '../../model/vendor/vendor.model';
import { TimeElapsedPipe } from '../../pipes/timeElapsed/time-elapsed.pipe';
import { AddStockRequest } from '../../model/inventory/inventory-item/add-stock-request.model';
import { SubStockRequest } from '../../model/inventory/inventory-item/sub-stock-request.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent, InventoryItemModalComponent, ToastComponent, RouterLink, ReactiveFormsModule, TimeElapsedPipe],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  totalStockWorth = 0;
  totalItemsTypes = 0;
  totalItemCount = 0;
  inventoryItems: InventoryItem[] = [];
  tempInventoryItem !: InventoryItem | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;
  adjustmentForm!: FormGroup;
  adjustmentMode: 'add' | 'subtract' = 'add';
  selectedInventoryItemForAdjustment: InventoryItem | null = null;
  vendors: Vendor[] = [];
  activeAdjustmentLabel = '';

  @ViewChild('launchInventoryItemModalButton') launchInventoryItemModalButton!: ElementRef;
  @ViewChild('launchAdjustmentModalButton') launchAdjustmentModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteInventoryItemButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllInventoryItemsButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(
    private inventoryService: InventoryService,
    private vendorService: VendorService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initAdjustmentForm();
    this.loadData();
    this.loadVendors();
  }

  initAdjustmentForm(): void {
    this.adjustmentForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      vendorId: [null],
      rate: ['', [Validators.min(0)]],
      amountPaid: [null, [Validators.min(0)]],
      dateOfTransaction: [null, Validators.required],
      addToLedger: [false]
    });
  }

  loadVendors(): void {
    this.vendorService.getAllVendors().subscribe({
      next: (res) => this.vendors = res,
      error: () => this.vendors = []
    });
  }

  loadData() {
    this.totalStockWorth = 0;
    this.totalItemsTypes = 0;
    this.totalItemCount = 0;
    this.inventoryService.getAllInventoryItems().subscribe({
      next: (res) => {
        this.inventoryItems = res;
        if (this.isRefreshingData) {
          this.showToastComponent("success", "Inventory-item data refreshed.");
          this.isRefreshingData = false;
        }
        res.forEach(i => {
          this.totalStockWorth = this.totalStockWorth + (i.quantity * i.rate);
          this.totalItemsTypes++
          this.totalItemCount = this.totalItemCount + i.quantity;
        });
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading inventory-items');
        this.isRefreshingData = false;
      },
    });
  }

  refreshData(): void {
    this.isRefreshingData = true;
    this.loadData();
  }

  addInventoryItem(): void {
    this.tempInventoryItem = null;
    this.launchInventoryItemModal();
  }

  openAddInventoryModal(inventoryItem: InventoryItem): void {
    this.adjustmentMode = 'add';
    this.activeAdjustmentLabel = `Add stock to ${inventoryItem.name}`;
    this.selectedInventoryItemForAdjustment = inventoryItem;
    this.adjustmentForm.reset({
      quantity: '',
      description: '',
      vendorId: null,
      rate: inventoryItem.rate,
      amountPaid: '',
      addToLedger: false
    });
    this.launchAdjustmentModal();
  }

  openSubtractInventoryModal(inventoryItem: InventoryItem): void {
    this.adjustmentMode = 'subtract';
    this.activeAdjustmentLabel = `Subtract stock from ${inventoryItem.name}`;
    this.selectedInventoryItemForAdjustment = inventoryItem;
    this.adjustmentForm.reset({
      quantity: '',
      description: '',
      vendorId: null,
      rate: 0,
      amountPaid: 0,
      addToLedger: false
    });
    this.launchAdjustmentModal();
  }

  submitAdjustment(): void {
    if (this.adjustmentForm.invalid || !this.selectedInventoryItemForAdjustment) {
      this.adjustmentForm.markAllAsTouched();
      return;
    }

    if (this.adjustmentMode === 'subtract') {
      const payload: SubStockRequest = {
        itemId: this.selectedInventoryItemForAdjustment.id,
        quantity: this.adjustmentForm.value.quantity,
        description: this.adjustmentForm.value.description,
        dateOfTransaction: this.adjustmentForm.value.dateOfTransaction
      };
      payload.quantity = Math.abs(payload.quantity);
      this.isSubmitting = true;
      this.inventoryService.subtractStock(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.adjustmentForm.reset();
          this.selectedInventoryItemForAdjustment = null;
          this.closeAdjustmentModal();
          this.showToastComponent('success', 'Stock subtracted successfully.');
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showToastComponent('error', err?.error?.message || 'Error updating inventory stock.');
        }
      });
    }
    else {
      const payload: AddStockRequest = {
        itemId: this.selectedInventoryItemForAdjustment.id,
        quantity: this.adjustmentForm.value.quantity,
        description: this.adjustmentForm.value.description,
        vendorId: this.adjustmentForm.value.vendorId || undefined,
        amountPaid: this.adjustmentForm.value.amountPaid,
        addToLedger: this.adjustmentForm.value.addToLedger,
        dateOfTransaction: this.adjustmentForm.value.dateOfTransaction
      };
      payload.quantity = Math.abs(payload.quantity);
      this.isSubmitting = true;
      this.inventoryService.addStock(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.adjustmentForm.reset();
          this.selectedInventoryItemForAdjustment = null;
          this.closeAdjustmentModal();
          this.showToastComponent('success', 'Stock added successfully.');
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showToastComponent('error', err?.error?.message || 'Error updating inventory stock.');
        }
      });
    }
  }

  editInventoryItem(inventoryItem: InventoryItem) {
    this.tempInventoryItem = inventoryItem;
    this.launchInventoryItemModal();
  }

  askDeleteInventoryItem(inventoryItem: InventoryItem) {
    this.deleteMsg = `Delete inventory-item ${inventoryItem.name}?`;
    this.tempInventoryItem = inventoryItem;
    this.launchConfirmDeleteModal();
  }

  deleteInventoryItem() {
    if (this.tempInventoryItem) {
      this.inventoryService.deleteInventoryItemById(this.tempInventoryItem.id).subscribe({
        next: () => {
          this.inventoryItems = this.inventoryItems.filter(c => c.id !== this.tempInventoryItem?.id);
          this.showToastComponent("warning", "Inventory-item deleted");
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting Inventory-item');
        },
      });
    }
  }

  askDeleteAllInventoryItems(): void {
    this.deleteMsg = 'Delete all inventory-items?';
    this.launchConfirmDeleteModal();
  }

  deleteAllInventoryItems(): void {
    this.inventoryService.deleteAllInventoryItems().subscribe({
      next: () => {
        this.inventoryItems = [];
        this.showToastComponent("warning", "All inventory-items deleted");
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error deleting inventory-items');
      },
    });
  }

  successAction(inventoryItem: InventoryItem): void {
    if (this.tempInventoryItem) {
      this.toastMsg = "Inventory-item updated.";
    }
    else {
      this.toastMsg = "Inventory-item added.";
    }
    this.tempInventoryItem = null;
    this.showToastComponent("success", this.toastMsg);
    this.loadData();
  }

  errorAction(errorStr: string): void {
    this.showToastComponent("error", errorStr);
  }

  launchInventoryItemModal(): void {
    this.launchInventoryItemModalButton.nativeElement.click();
  }

  launchAdjustmentModal(): void {
    this.launchAdjustmentModalButton.nativeElement.click();
  }

  closeAdjustmentModal(): void {
    (document.querySelector('#inventoryAdjustmentModalCloseBtn') as HTMLElement)?.click();
  }

  launchConfirmDeleteModal(): void {
    this.launchConfirmDeleteButton.nativeElement.click();
  }

  launchConfirmDeleteAllModal(): void {
    this.launchConfirmDeleteAllButton.nativeElement.click();
  }

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }
}
