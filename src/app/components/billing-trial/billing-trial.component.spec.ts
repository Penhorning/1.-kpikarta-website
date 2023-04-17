import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingTrialComponent } from './billing-trial.component';

describe('BillingTrialComponent', () => {
  let component: BillingTrialComponent;
  let fixture: ComponentFixture<BillingTrialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingTrialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingTrialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
