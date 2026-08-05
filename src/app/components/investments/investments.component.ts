import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastComponent } from "../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../utility/confirm-dialog/confirm-dialog.component";
import { TimeElapsedPipe } from "../../pipes/timeElapsed/time-elapsed.pipe";
import { InvestmentService } from '../../services/investment/investment.service';
import { Investment } from '../../model/investment/investment.model';
import { InvestmentModalComponent } from "./investment-modal/investment-modal.component";

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastComponent, ConfirmDialogComponent, TimeElapsedPipe, InvestmentModalComponent],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.css'
})

export class InvestmentsComponent implements OnInit {

  investments: Investment[] = [];
  tempInvestment !: Investment | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;

  filteredOrders: any[] = [];   // filtered & sorted list
  filterStatus: string = '';    // holds dropdown value
  sortBy: string = 'createdAt_desc';
  searchTerm: string = '';
  activeFiltersCount = 0;
  activeFiltersSummary = '';
  viewType = "list";

  @ViewChild('launchInvestmentModalButton') launchInvestmentModalButton!: ElementRef;
  @ViewChild('launchConfirmDeleteInvestmentButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllInvestmentsButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private router: Router, private investmentService: InvestmentService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.investmentService.getAllInvestments().subscribe({
      next: (res) => {
        this.investments = res;
        this.applyFilters();
        if (this.isRefreshingData) {
          this.showToastComponent("success", "Investments data refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading investments');
        this.isRefreshingData = false;
      },
    });
  }

  refreshData(): void {
    this.isRefreshingData = true;
    this.loadData();
  }

  applyFilters() {
    let data = [...this.investments];
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.description.toLowerCase().includes(term) ||
        o.amount.toString().includes(term)
      );
    }
    // Status filter
    // Sorting
    switch (this.sortBy) {
      case 'createdAt_desc':
        data.sort((a, b) => +new Date(b.dateOfInvestment) - +new Date(a.dateOfInvestment));
        break;
      case 'createdAt_asc':
        data.sort((a, b) => +new Date(a.dateOfInvestment) - +new Date(b.dateOfInvestment));
        break;
      case 'amount_desc':
        data.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        data.sort((a, b) => a.amount - b.amount);
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

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = '';
    this.sortBy = 'createdAt_desc';
    this.applyFilters(); // reset filters count
  }

  changeViewType(type: string): void {
    this.viewType = type;
  }

  addInvestment(): void {
    this.tempInvestment = null;
    this.launchInvestmentModal();
  }

  editInvestment(investment: Investment) {
    this.tempInvestment = investment;
    this.launchInvestmentModal();
  }

  askDeleteInvestment(investment: Investment): void {
    this.deleteMsg = `Delete investment ${investment.uuid}?`;
    this.tempInvestment = investment;
    this.launchConfirmDeleteModal();
  }

  deleteInvestment() {
    if (this.tempInvestment) {
      this.investmentService.deleteInvestmentByUuid(this.tempInvestment.uuid).subscribe({
        next: () => {
          this.investments = this.investments.filter(c => c.uuid !== this.tempInvestment?.uuid);
          this.showToastComponent("warning", "Investment deleted");
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting investment');
        },
      });
    }
  }

  askDeleteAllInvestments() {
    this.deleteMsg = 'Delete all investments?';
    this.launchConfirmDeleteAllModal();
  }

  deleteAllInvestments(): void {
    this.investmentService.deleteAllInvestments().subscribe({
      next: () => {
        this.investments = [];
        this.showToastComponent("warning", "All investments deleted");
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error deleting investments');
      },
    });
  }

  successAction(investment: Investment): void {
    if (this.tempInvestment) {
      // let index = this.investments.findIndex(c => c.id === this.tempInvestment?.id);
      // if (index !== -1) {
      //   this.investments[index] = { ...this.tempInvestment };
      // }
      this.toastMsg = "Investment updated.";
    }
    else {
      // this.investments.push(investment);
      this.toastMsg = "Investment added.";
    }
    this.tempInvestment = null;
    this.showToastComponent("success", this.toastMsg);
    this.loadData();
  }

  errorAction(errorStr: string): void {
    this.showToastComponent("error", errorStr);
  }

  launchInvestmentModal(): void {
    this.launchInvestmentModalButton.nativeElement.click();
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

  openDetails(investment: Investment) {
    this.router.navigate(['/dashboard/investment', investment.uuid]);
  }

}
