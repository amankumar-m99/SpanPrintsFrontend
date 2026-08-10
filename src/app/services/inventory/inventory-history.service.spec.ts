import { TestBed } from '@angular/core/testing';

import { InventoryHistoryService } from './inventory-history.service';

describe('InventoryHistoryService', () => {
  let service: InventoryHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
