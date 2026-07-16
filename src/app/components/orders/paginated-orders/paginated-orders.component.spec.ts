import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatedOrdersComponent } from './paginated-orders.component';

describe('PaginatedOrdersComponent', () => {
  let component: PaginatedOrdersComponent;
  let fixture: ComponentFixture<PaginatedOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatedOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginatedOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
