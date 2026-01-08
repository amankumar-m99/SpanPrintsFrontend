import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredFieldMarkerComponent } from './required-field-marker.component';

describe('RequiredFieldMarkerComponent', () => {
  let component: RequiredFieldMarkerComponent;
  let fixture: ComponentFixture<RequiredFieldMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequiredFieldMarkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequiredFieldMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
