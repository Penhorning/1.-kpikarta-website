import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedemptionSignUpComponent } from './appsumo-signup.component';

describe('RedemptionSignUpComponent', () => {
  let component: RedemptionSignUpComponent;
  let fixture: ComponentFixture<RedemptionSignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedemptionSignUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedemptionSignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
