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
