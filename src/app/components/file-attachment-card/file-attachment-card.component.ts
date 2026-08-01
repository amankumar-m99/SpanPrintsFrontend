import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileAttachment } from '../../model/file-attachment/file-attachment.model';
import { FileAttachmentService, getPreviewType, PreviewType } from '../../services/file-attachment/file-attachment.service';
import { FilePreviewComponent } from "../file-preview/file-preview.component";
import { CommonModule } from '@angular/common';
import { FileSizePipe } from "../../pipes/file-size/file-size.pipe";
import { TimeElapsedPipe } from "../../pipes/timeElapsed/time-elapsed.pipe";
import { OrderService } from '../../services/order/order.service';
import { SuccessResponse } from '../../model/text-responses/success-response.model';
import { ErrorResponse } from '../../model/text-responses/error-response.model';

@Component({
  selector: 'app-file-attachment-card',
  standalone: true,
  imports: [FilePreviewComponent, CommonModule, FileSizePipe, TimeElapsedPipe],
  templateUrl: './file-attachment-card.component.html',
  styleUrl: './file-attachment-card.component.css'
})

export class FileAttachmentCardComponent implements OnInit {

  @Input("fileAttachment") file?: FileAttachment;
  @Input("orderUuid") orderUuid?: string;
  @Output("deleteSuccessAction") deleteSuccessAction = new EventEmitter<SuccessResponse>();
  @Output("deleteFailAction") deleteFailAction = new EventEmitter<ErrorResponse>();

  previewType?: PreviewType;
  fileNameWithExt: string = '';

  constructor(private fileAttachmentService: FileAttachmentService, private orderService: OrderService) { }

  ngOnInit(): void {
    this.fileNameWithExt = this.file?.originalFileName + '.' + this.file?.fileType;
    this.previewType = getPreviewType(this.file?.contentType || '', this.fileNameWithExt);
  }

  downloadFile(): void {
    let uuid = this.file?.uuid;
    let fileName = this.file?.originalFileName;
    if (uuid && fileName) {
      this.fileAttachmentService.downloadFile(uuid).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName; // fallback name if you can't read it from headers
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          // show a toast/snackbar to the user
        }
      });
    }
  }

  deleteFile(): void {
    const conf = confirm("Do you want to delete file '" + this.file?.originalFileName + "' ?");
    if (conf && this.orderUuid && this.file?.uuid) {
      this.orderService.deleteFile(this.orderUuid, this.file?.uuid).subscribe({
        next: (res) => {
          const resp: SuccessResponse = { ...res };
          this.deleteSuccessAction.emit(resp)
        },
        error: (err) => {
          const resp: ErrorResponse = { ...err };
          this.deleteFailAction.emit(resp)
        }
      });
    }
  }

  updatePreviewType(type: PreviewType) {
    this.previewType = type;
  }

}
