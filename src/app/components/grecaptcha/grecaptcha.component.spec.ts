import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrecaptchaComponent } from './grecaptcha.component';

describe('GrecaptchaComponent', () => {
  let component: GrecaptchaComponent;
  let fixture: ComponentFixture<GrecaptchaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrecaptchaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrecaptchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
