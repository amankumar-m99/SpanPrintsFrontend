import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { FileAttachment } from '../../model/file-attachment/file-attachment.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileAttachmentService {

  private url = Constant.API_URL + '/file-attachments';

  constructor(private http: HttpClient) { }

  getFileAttachmentByOrderUuid(uuid: string) {
    return this.http.get<FileAttachment[]>(`${this.url}/uuid/${uuid}`);
  }

  downloadFile(uuid: string): Observable<Blob> {
    return this.http.get(`${this.url}/download/${uuid}`, {
      responseType: 'blob',
      observe: 'body'
    });
  }

  previewFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.url}/preview/${fileId}`, { responseType: 'blob' });
  }
}

export type PreviewType = 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'office' | 'unsupported';

export function getPreviewType(mimeType: string, fileName: string): PreviewType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/') || mimeType === 'application/json') return 'text';

  const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
  if (officeExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) return 'office';

  return 'unsupported';
}
