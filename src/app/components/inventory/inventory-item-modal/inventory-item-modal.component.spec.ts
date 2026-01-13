import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryItemModalComponent } from './inventory-item-modal.component';

describe('InventoryItemModalComponent', () => {
  let component: InventoryItemModalComponent;
  let fixture: ComponentFixture<InventoryItemModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryItemModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
