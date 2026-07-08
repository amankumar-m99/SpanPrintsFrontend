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
}
