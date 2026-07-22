import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOrderDescriptionModalComponent } from './update-order-description-modal.component';

describe('UpdateOrderDescriptionModalComponent', () => {
  let component: UpdateOrderDescriptionModalComponent;
  let fixture: ComponentFixture<UpdateOrderDescriptionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateOrderDescriptionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateOrderDescriptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
