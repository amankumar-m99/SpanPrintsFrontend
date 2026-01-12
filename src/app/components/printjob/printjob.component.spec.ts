import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintjobComponent } from './printjob.component';

describe('PrintjobComponent', () => {
  let component: PrintjobComponent;
  let fixture: ComponentFixture<PrintjobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintjobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
