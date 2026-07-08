import { Component, Input } from '@angular/core';
import { FileAttachment } from '../../model/file-attachment/file-attachment.model';
import { FileAttachmentService } from '../../services/file-attachment/file-attachment.service';

@Component({
  selector: 'app-file-attachment-card',
  standalone: true,
  imports: [],
  templateUrl: './file-attachment-card.component.html',
  styleUrl: './file-attachment-card.component.css'
})
export class FileAttachmentCardComponent {
  @Input() fileAttachment?: FileAttachment;

  constructor(private fileAttachmentService: FileAttachmentService) { }

  downloadFile(): void {
    let uuid = this.fileAttachment?.uuid;
    let fileName = this.fileAttachment?.originalFileName;
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
}
