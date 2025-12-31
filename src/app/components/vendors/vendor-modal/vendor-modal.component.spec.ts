import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorModalComponent } from './vendor-modal.component';

describe('VendorModalComponent', () => {
  let component: VendorModalComponent;
  let fixture: ComponentFixture<VendorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
