import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileAttachmentService, getPreviewType, PreviewType } from '../../services/file-attachment/file-attachment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-preview.component.html',
  styleUrl: './file-preview.component.css'
})
export class FilePreviewComponent implements OnInit, OnDestroy {
  @Input() fileId!: string;
  @Input() fileName!: string;
  @Input() mimeType!: string;

  previewType!: PreviewType;
  safeUrl!: SafeResourceUrl;
  textContent = '';
  loading = true;
  private objectUrl?: string;

  constructor(private fileAttachmentService: FileAttachmentService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    console.log(this.fileName);
    this.previewType = getPreviewType(this.mimeType, this.fileName);
    if (this.previewType === 'unsupported') {
      this.loading = false;
      return;
    }

    this.fileAttachmentService.previewFile(this.fileId).subscribe({
      next: (blob) => {
        if (this.previewType === 'text') {
          blob.text().then(text => {
            this.textContent = text;
            this.loading = false;
          });
        } else {
          this.objectUrl = URL.createObjectURL(blob);
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
          this.loading = false;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl); // avoid memory leaks
  }

  download(): void {
    // reuse your download logic from earlier
  }
}