import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOrderNoteModalComponent } from './update-order-note-modal.component';

describe('UpdateOrderNoteModalComponent', () => {
  let component: UpdateOrderNoteModalComponent;
  let fixture: ComponentFixture<UpdateOrderNoteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateOrderNoteModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateOrderNoteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
