import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OderDepositAmountModalComponent } from './oder-deposit-amount-modal.component';

describe('OderDepositAmountModalComponent', () => {
  let component: OderDepositAmountModalComponent;
  let fixture: ComponentFixture<OderDepositAmountModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OderDepositAmountModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OderDepositAmountModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
