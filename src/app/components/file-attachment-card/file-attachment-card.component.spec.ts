import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileAttachmentCardComponent } from './file-attachment-card.component';

describe('FileAttachmentCardComponent', () => {
  let component: FileAttachmentCardComponent;
  let fixture: ComponentFixture<FileAttachmentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileAttachmentCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileAttachmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
