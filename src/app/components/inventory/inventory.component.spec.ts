import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { InventoryComponent } from './inventory.component';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open add stock adjustment modal for the selected inventory item', () => {
    const item = {
      id: 12,
      uuid: 'abc',
      name: 'Paper',
      code: 'P-01',
      description: 'A4',
      quantity: 10,
      rate: 5,
      updatedAt: '',
      createdAt: '',
      inventoryId: 1,
      inventoryHistoryIds: []
    } as any;

    component.openAddInventoryModal(item);

    expect(component.adjustmentMode).toBe('add');
    expect(component.selectedInventoryItemForAdjustment?.id).toBe(12);
  });
});
