import { TestBed } from '@angular/core/testing';

import { PrintjobtypeService } from './printjobtype.service';

describe('PrintjobtypeService', () => {
  let service: PrintjobtypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintjobtypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
