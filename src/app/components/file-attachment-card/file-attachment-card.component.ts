import { Component, Input, OnInit } from '@angular/core';
import { FileAttachment } from '../../model/file-attachment/file-attachment.model';
import { FileAttachmentService, getPreviewType, PreviewType } from '../../services/file-attachment/file-attachment.service';
import { FilePreviewComponent } from "../file-preview/file-preview.component";
import { CommonModule } from '@angular/common';
import { FileSizePipe } from "../../pipes/file-size/file-size.pipe";
import { DateElapsedPipe } from "../../pipes/date-elapsed/date-elapsed.pipe";

@Component({
  selector: 'app-file-attachment-card',
  standalone: true,
  imports: [FilePreviewComponent, CommonModule, FileSizePipe, DateElapsedPipe],
  templateUrl: './file-attachment-card.component.html',
  styleUrl: './file-attachment-card.component.css'
})
export class FileAttachmentCardComponent implements OnInit {
  @Input("fileAttachment") file?: FileAttachment;
  previewType?: PreviewType;
  fileNameWithExt: string = '';

  constructor(private fileAttachmentService: FileAttachmentService) { }

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
          console.error('Download failed', err);
          // show a toast/snackbar to the user
        }
      });
    }
  }

  updatePreviewType(type: PreviewType) {
    this.previewType = type;
  }
}
