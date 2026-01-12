import { Component, ElementRef, ViewChild } from '@angular/core';
import { PrintJobType } from '../../model/order/printjobtype.model';
import { PrintJobTypeService } from '../../services/order/printjobtype.service';
import { ConfirmDialogComponent } from '../utility/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../utility/toast/toast.component';
import { PrintjobtypeModalComponent } from "./printjobtype-modal/printjobtype-modal.component";

@Component({
  selector: 'app-printjob',
  standalone: true,
  imports: [CommonModule, ToastComponent, ConfirmDialogComponent, PrintjobtypeModalComponent],
  templateUrl: './printjob.component.html',
  styleUrl: './printjob.component.css'
})
export class PrintjobComponent {

  printJobTypes: PrintJobType[] = [];
  tempPrintJobType !: PrintJobType | null;
  isSubmitting = false;
  isRefreshingData = false;
  deleteMsg = '';
  toastType = 'info';
  toastMsg = '';
  showToast = false;

  @ViewChild('launchPrintJobTypeModalButton') launchPrintJobTypeModalButton!: ElementRef;
  @ViewChild('launchConfirmDeletePrintJobTypeButton') launchConfirmDeleteButton!: ElementRef;
  @ViewChild('launchConfirmDeleteAllPrintJobTypesButton') launchConfirmDeleteAllButton!: ElementRef;

  constructor(private printJobTypeService: PrintJobTypeService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.printJobTypeService.getAllPrintJobTypes().subscribe({
      next: (res) => {
        this.printJobTypes = res;
        if (this.isRefreshingData) {
          this.showToastComponent("success", "Print-job data refreshed.");
          this.isRefreshingData = false;
        }
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error loading print-jobs');
        this.isRefreshingData = false;
      },
    });
  }

  refreshData(): void {
    this.isRefreshingData = true;
    this.loadData();
  }

  addPrintJobType(): void {
    this.tempPrintJobType = null;
    this.launchPrintJobTypeModal();
  }

  editPrintJobType(printJobType: PrintJobType) {
    this.tempPrintJobType = printJobType;
    this.launchPrintJobTypeModal();
  }

  askDeletePrintJobType(printJobType: PrintJobType) {
    this.deleteMsg = `Delete print-job ${printJobType.name}?`;
    this.tempPrintJobType = printJobType;
    this.launchConfirmDeleteModal();
  }

  deletePrintJobType() {
    if (this.tempPrintJobType) {
      this.printJobTypeService.deletePrintJobTypeById(this.tempPrintJobType.id).subscribe({
        next: () => {
          this.printJobTypes = this.printJobTypes.filter(c => c.id !== this.tempPrintJobType?.id);
          this.showToastComponent("warning", "Print-job deleted");
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting Print-job');
        },
      });
    }
  }

  askDeleteAllPrintJobTypes(): void {
    this.deleteMsg = 'Delete all print-jobs?';
    this.launchConfirmDeleteModal();
  }

  deleteAll(): void {
    this.printJobTypeService.deleteAllPrintJobTypes().subscribe({
      next: () => {
        this.printJobTypes = [];
        this.showToastComponent("warning", "All print-jobs deleted");
      },
      error: (err) => {
        this.showToastComponent("error", err?.error?.message || 'Error deleting print-jobs');
      },
    });
  }

  successAction(printJobType: PrintJobType): void {
    if (this.tempPrintJobType) {
      this.toastMsg = "Print-job updated.";
    }
    else {
      this.toastMsg = "Print-job added.";
    }
    this.tempPrintJobType = null;
    this.showToastComponent("success", this.toastMsg);
    this.loadData();
  }

  errorAction(errorStr: string): void {
    this.showToastComponent("error", errorStr);
  }

  launchPrintJobTypeModal(): void {
    this.launchPrintJobTypeModalButton.nativeElement.click();
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
