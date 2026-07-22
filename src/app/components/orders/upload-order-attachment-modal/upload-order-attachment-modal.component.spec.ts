import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadOrderAttachmentModalComponent } from './upload-order-attachment-modal.component';

describe('UploadOrderAttachmentModalComponent', () => {
  let component: UploadOrderAttachmentModalComponent;
  let fixture: ComponentFixture<UploadOrderAttachmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadOrderAttachmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadOrderAttachmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
