import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../../utility/confirm-dialog/confirm-dialog.component";
import { FormsModule } from '@angular/forms';
import { Constant } from '../../../constant/Constant';
import { TimeElapsedPipe } from "../../../pipes/timeElapsed/time-elapsed.pipe";
import { InvestmentModalComponent } from '../investment-modal/investment-modal.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { Investment } from '../../../model/investment/investment.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-investment-info',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InvestmentModalComponent, ToastComponent, ConfirmDialogComponent, TimeElapsedPipe],
  templateUrl: './investment-info.component.html',
  styleUrl: './investment-info.component.css'
})
export class InvestmentInfoComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  investmentUuid !: string;
  investment?: Investment;

  errorMsg = '';
  copied = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';
  showToast = false;

  enteredUuid = '';
  isUuidValid = false;
  private uuidRegex: RegExp = Constant.UUID_REGEX;

  constructor(private router: Router, private route: ActivatedRoute, private investmentService: InvestmentService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.investmentUuid = uuid;
        this.fetchInvestmentDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchInvestmentDetails() {
    this.investmentService.getInvestmentByUuid(this.investmentUuid).subscribe({
      next: (res) => {
        this.investment = res;
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load investment's data!";
      }
    });
  }

  deleteInvestment() {
    if (this.investment) {
      this.investmentService.deleteInvestmentByUuid(this.investment.uuid).subscribe({
        next: () => {
          this.showToastComponent("warning", "Investment deleted");
          this.router.navigate(['/dashboard/investments']);
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting investment');
        },
      });
    }
  }

  copyUuid() {
    if (this.investment?.uuid) {
      navigator.clipboard.writeText(this.investment.uuid).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1500);
      });
    }
  }

  investmentSuccess(investment: Investment): void {
    this.showToastComponent("success", "Investment updated.");
    this.fetchInvestmentDetails();
  }

  investmentError(errorStr: string): void {
    this.showToastComponent("error", errorStr)
  }

  reloadWindow() {
    window.location.reload();
  }

  validateUuid() {
    this.isUuidValid = this.uuidRegex.test(this.enteredUuid.trim());
  }

  navigateWithUuid() {
    if (!this.isUuidValid) return;
    this.router.navigate(['/dashboard/investment', this.enteredUuid.trim()]);
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.enteredUuid = text.trim();
      this.validateUuid();
    } catch {
      alert('Clipboard access denied');
    }
  }

  editInvestment(investment?: Investment) { }

  askDeleteInvestment(investment?: Investment): void { }

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }

}
