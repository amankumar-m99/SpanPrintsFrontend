import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../utility/toast/toast.component";
import { ConfirmDialogComponent } from "../../utility/confirm-dialog/confirm-dialog.component";
import { FormsModule } from '@angular/forms';
import { Constant } from '../../../constant/Constant';
import { Order } from '../../../model/order/order.model';
import { OrderService } from '../../../services/order/order.service';
import { OrderModalComponent } from "../order-modal/order-modal.component";
import { FileAttachmentService } from '../../../services/file-attachment/file-attachment.service';
import { FileAttachment } from '../../../model/file-attachment/file-attachment.model';
import { TimeElapsedPipe } from "../../../pipes/timeElapsed/time-elapsed.pipe";
import { DaysElapsedPipe } from "../../../pipes/days-elapsed/days-elapsed.pipe";
import { FileSizePipe } from '../../../pipes/file-size/file-size.pipe';
import { UpdateOrderNoteModalComponent } from "../update-order-note-modal/update-order-note-modal.component";
import { UpdateOrderStatusRequest } from '../../../model/order/update-order-status.model';
import { OrderStatus } from '../../../enums/order-status.enum';
import { EnumOption, enumToOptions } from '../../../enums/enum-helper.';
import { UpdateOrderDescriptionModalComponent } from "../update-order-description-modal/update-order-description-modal.component";
import { UploadOrderAttachmentModalComponent } from "../upload-order-attachment-modal/upload-order-attachment-modal.component";
import { OderDepositAmountModalComponent } from "../oder-deposit-amount-modal/oder-deposit-amount-modal.component";
import { SuccessResponse } from '../../../model/text-responses/success-response.model';
import { ErrorResponse } from '../../../model/text-responses/error-response.model';
import { EnumdisplayPipe } from "../../../pipes/enumdisplay/enumdisplay.pipe";
import { SentencecasePipe } from "../../../pipes/sentencecase/sentencecase.pipe";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-info',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ToastComponent, ConfirmDialogComponent, OrderModalComponent, DaysElapsedPipe, TimeElapsedPipe, FileSizePipe, UpdateOrderNoteModalComponent, UpdateOrderDescriptionModalComponent, UploadOrderAttachmentModalComponent, OderDepositAmountModalComponent, EnumdisplayPipe, SentencecasePipe],
  templateUrl: './order-info.component.html',
  styleUrl: './order-info.component.css'
})
export class OrderInfoComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  orderStatusOptions: EnumOption[] = enumToOptions(OrderStatus);
  orderUuid !: string;
  order !: Order;
  fileAttachments?: FileAttachment[];
  errorMsg = '';
  copied = false;
  toastType = 'info';
  toastMsg = '';
  deleteMsg = '';
  showToast = false;
  previewFile?: FileAttachment;
  previewUrl: string | null = null;
  isPreviewImage = false;

  enteredUuid = '';
  isUuidValid = false;
  private uuidRegex: RegExp = Constant.UUID_REGEX;

  constructor(private router: Router, private route: ActivatedRoute, private orderService: OrderService, private fileAttachmentService: FileAttachmentService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.orderUuid = uuid;
        this.fetchOrderDetails(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchOrderDetails(isRefresh: boolean) {
    this.orderService.getOrderByUuid(this.orderUuid).subscribe({
      next: (res) => {
        this.errorMsg = '';
        this.deleteMsg = `Delete this customer?`;
        if (isRefresh) {
          this.orderSuccess(res);
        }
        else {
          this.order = res;
        }
        this.fetchFileAttachments();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load order details!";
        this.orderError(this.errorMsg);
      }
    });
  }

  fetchFileAttachments() {
    this.fileAttachmentService.getFileAttachmentByOrderUuid(this.orderUuid).subscribe({
      next: (res) => {
        this.fileAttachments = res;
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || "Could not load file attachments";
      }
    });
  }

  reloadOrderDetails() {
    this.fetchOrderDetails(true);
  }

  depositPendingAmount() {
    if (this.order) {
      const userApproved = confirm("Deposit the pending amount and mark as paid ?");
      if (!userApproved)
        return;
      this.orderService.depositPendingAmount(this.order.uuid).subscribe({
        next: (res) => {
          this.orderSuccess(res);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || "Could not load order details!";
          this.orderError(this.errorMsg);
        }
      });
    }
  }

  discountPendingAmount() {
    if (this.order) {
      const userApproved = confirm("Convert the pending amont as discount and mark as paid ?");
      if (!userApproved)
        return;
      this.orderService.discountPendingAmount(this.order.uuid).subscribe({
        next: (res) => {
          this.orderSuccess(res);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || "Could not load order details!";
          this.orderError(this.errorMsg);
        }
      });
    }
  }

  updateOrderStatus(orderStatus: string) {
    if (this.order) {
      let data: UpdateOrderStatusRequest = {
        'orderUuid': this.order.uuid,
        'printJobStatus': orderStatus
      }
      this.orderService.updateOrderStatus(data).subscribe({
        next: (res) => {
          this.orderSuccess(res);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || "Could not load order details!";
          this.orderError(this.errorMsg);
        }
      });
    }
  }

  deleteOrder() {
    if (this.order) {
      this.orderService.deleteOrderByUuid(this.order.uuid).subscribe({
        next: () => {
          this.showToastComponent("warning", "Customer deleted");
          this.router.navigate(['/dashboard/customers']);
        },
        error: (err) => {
          this.showToastComponent("error", err?.error?.message || 'Error occured while deleting customer');
        },
      });
    }
  }

  copyUuid() {
    if (this.order?.uuid) {
      navigator.clipboard.writeText(this.order.uuid).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1500);
      });
    }
  }

  fileUploadSuccess(order: Order): void {
    this.orderSuccess(order);
    this.fetchFileAttachments();
  }
  orderSuccess(order: Order): void {
    this.order = order;
    this.showToastComponent("success", "Order updated.");
    // this.fetchOrderDetails();
  }

  orderError(errorStr: string): void {
    this.showToastComponent("error", errorStr)
  }

  reload() {
    window.location.reload();
  }

  deleteSuccessAction(successResponse: SuccessResponse) {
    this.showToastComponent("success", successResponse.message);
    this.fetchOrderDetails(false);
  }

  deleteFailAction(errorResponse: ErrorResponse) {
    this.showToastComponent("error", errorResponse.message);
  }

  downloadAttachment(file: FileAttachment): void {
    if (!file?.uuid) return;

    this.fileAttachmentService.downloadFile(file.uuid).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalFileName || file.createdFileName || 'attachment';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.showToastComponent('error', 'Unable to download the selected file.');
      }
    });
  }

  previewAttachment(file: FileAttachment, inNewTab: boolean): void {
    if (!file?.uuid) return;

    this.previewFile = file;
    this.isPreviewImage = (file.contentType || '').toLowerCase().includes('image');

    this.fileAttachmentService.downloadFile(file.uuid).subscribe({
      next: (blob: Blob) => {
        this.previewUrl = window.URL.createObjectURL(blob);
        if (inNewTab) {
          window.open(this.previewUrl, '_blank');
          setTimeout(() => {
            if (this.previewUrl) {
              window.URL.revokeObjectURL(this.previewUrl);
            }
            this.previewUrl = null;
            this.previewFile = undefined;
          }, 10000);
        }
      },
      error: () => {
        this.previewFile = undefined;
        this.previewUrl = null;
        this.isPreviewImage = false;
        this.showToastComponent('error', 'Unable to preview the selected file.');
      }
    });
  }

  openImagePreview(file: FileAttachment): void {
    if (!this.supportsPreview(file)) {
      return;
    }

    this.previewAttachment(file, false);
  }

  closePreview(): void {
    if (this.previewUrl) {
      window.URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    this.previewFile = undefined;
    this.isPreviewImage = false;
  }

  deleteAttachment(file: FileAttachment): void {
    if (!this.order?.uuid || !file?.uuid) return;

    const confirmed = confirm(`Delete file "${file.originalFileName}"?`);
    if (!confirmed) return;

    this.orderService.deleteFile(this.order.uuid, file.uuid).subscribe({
      next: (res) => {
        this.showToastComponent('success', res?.message || 'File deleted successfully.');
        this.fetchOrderDetails(false);
      },
      error: (err) => {
        this.showToastComponent('error', err?.error?.message || 'Unable to delete the selected file.');
      }
    });
  }

  getAttachmentIcon(file: FileAttachment): string {
    const contentType = (file?.contentType || '').toLowerCase();
    if (contentType.includes('pdf')) return 'bi-file-earmark-pdf-fill';
    if (contentType.includes('image')) return 'bi-file-earmark-image-fill';
    if (contentType.includes('word') || contentType.includes('officedocument')) return 'bi-file-earmark-word-fill';
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'bi-file-earmark-excel-fill';
    if (contentType.includes('text')) return 'bi-file-earmark-text-fill';
    return 'bi-file-earmark-fill';
  }

  getAttachmentBadge(file: FileAttachment): string {
    const contentType = (file?.contentType || '').toLowerCase();
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('image')) return 'Image';
    if (contentType.includes('word')) return 'Word';
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'Sheet';
    if (contentType.includes('text')) return 'Text';
    return (file?.fileType || 'File').toUpperCase();
  }

  supportsPreview(file: FileAttachment): boolean {
    const contentType = (file?.contentType || '').toLowerCase();
    return contentType.includes('pdf') || contentType.includes('image');
  }

  supportsPreviewModal(file: FileAttachment): boolean {
    const contentType = (file?.contentType || '').toLowerCase();
    return (contentType || '').toLowerCase().includes('image');
  }

  validateUuid() {
    this.isUuidValid = this.uuidRegex.test(this.enteredUuid.trim());
  }

  navigateWithUuid() {
    if (!this.isUuidValid) return;
    this.router.navigate(['/dashboard/customer', this.enteredUuid.trim()]);
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

  showToastComponent(type: string, msg: string): void {
    this.toastType = type;
    this.toastMsg = msg;
    this.showToast = true;
  }

  hideToastComponent(): void {
    this.showToast = false
  }

}
