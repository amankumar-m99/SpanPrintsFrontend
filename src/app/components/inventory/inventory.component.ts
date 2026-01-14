import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { InventoryItem } from '../../model/inventory/inventory-item/inventory-item.model';
import { InventoryService } from '../../services/inventory/inventory.service';
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";
import { InventoryItemModalComponent } from "./inventory-item-modal/inventory-item-modal.component";
import { ToastComponent } from "../utility/toast/toast.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent, InventoryItemModalComponent, ToastComponent, RouterLink],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent {
  inventoryItems: InventoryItem[] = [];
  tempInventoryItem !: InventoryItem | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;

  @ViewChild('launchInventoryItemModalButton') launchInventoryItemModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteInventoryItemButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllInventoryItemsButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.inventoryService.getAllInventoryItems().subscribe({
      next: (res) => {
        this.inventoryItems = res;
        if (this.isRefreshingData) {
          this.showToastComponent("success", "Inventory-item data refreshed.");
          this.isRefreshingData = false;
        }
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
