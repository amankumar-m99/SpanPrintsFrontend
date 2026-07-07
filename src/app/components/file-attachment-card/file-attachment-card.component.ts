import { Component, Input } from '@angular/core';
import { FileAttachment } from '../../model/file-attachment/file-attachment.model';

@Component({
  selector: 'app-file-attachment-card',
  standalone: true,
  imports: [],
  templateUrl: './file-attachment-card.component.html',
  styleUrl: './file-attachment-card.component.css'
})
export class FileAttachmentCardComponent {
  @Input() fileAttachment?: FileAttachment;
}
