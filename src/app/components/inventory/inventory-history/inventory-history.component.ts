import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InventoryHistory } from '../../../model/inventory/inventory-historty.model';
import { TimeElapsedPipe } from '../../../pipes/timeElapsed/time-elapsed.pipe';
import { InventoryHistoryService } from '../../../services/inventory/inventory-history.service';

@Component({
  selector: 'app-inventory-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TimeElapsedPipe],
  templateUrl: './inventory-history.component.html',
  styleUrl: './inventory-history.component.css'
})
export class InventoryHistoryComponent implements OnInit {
  inventoryHistories: InventoryHistory[] = [];
  filteredInventoryHistories: InventoryHistory[] = [];
  isLoading = false;
  searchText = '';
  selectedAction = '';
  actionOptions = [
    { value: 'add', label: 'Add' },
    { value: 'subtract', label: 'Subtract' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'sale', label: 'Sale' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'adjustment', label: 'Adjustment' }
  ];

  totals = {
    records: 0,
    quantity: 0,
    amount: 0
  };

  constructor(private inventoryHistoryService: InventoryHistoryService) { }

  ngOnInit(): void {
    this.loadInventoryHistory();
  }

  loadInventoryHistory(): void {
    this.isLoading = true;
    this.inventoryHistoryService.getAllInventoryHistories().subscribe({
      next: (histories) => {
        this.inventoryHistories = histories || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.inventoryHistories = [];
        this.filteredInventoryHistories = [];
        this.totals = { records: 0, quantity: 0, amount: 0 };
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchText?.trim().toLowerCase();
    const action = this.selectedAction?.trim().toLowerCase();

    this.filteredInventoryHistories = this.inventoryHistories.filter(history => {
      const matchesSearch = !search || [
        history.action,
        history.description,
        history.uuid,
        history.itemId?.toString(),
        history.inventoryItemId?.toString(),
        history.vendorId?.toString()
      ].some(value => `${value ?? ''}`.toLowerCase().includes(search));

      const matchesAction = !action || `${history.action ?? ''}`.toLowerCase() === action;
      return matchesSearch && matchesAction;
    });

    this.calculateTotals();
  }

  calculateTotals(): void {
    this.totals.records = this.filteredInventoryHistories.length;
    this.totals.quantity = this.filteredInventoryHistories.reduce((sum, history) => sum + (history.quantity || 0), 0);
    this.totals.amount = this.filteredInventoryHistories.reduce((sum, history) => sum + (history.amount || 0), 0);
  }

  getActionBadgeClass(history: InventoryHistory): string {
    switch (`${history.action ?? ''}`.toLowerCase()) {
      case 'add':
      case 'purchase':
        return 'badge bg-success';
      case 'subtract':
      case 'sale':
        return 'badge bg-danger';
      case 'transfer':
      case 'adjustment':
        return 'badge bg-info text-dark';
      default:
        return 'badge bg-secondary';
    }
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedAction = '';
    this.applyFilters();
  }

  trackByHistory(_: number, history: InventoryHistory): number {
    return history.id;
  }
}
