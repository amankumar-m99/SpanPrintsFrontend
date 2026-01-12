import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintjobtypeModalComponent } from './printjobtype-modal.component';

describe('PrintjobtypeModalComponent', () => {
  let component: PrintjobtypeModalComponent;
  let fixture: ComponentFixture<PrintjobtypeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintjobtypeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintjobtypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
