import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialKartaComponent } from './trial-karta.component';

describe('TrialKartaComponent', () => {
  let component: TrialKartaComponent;
  let fixture: ComponentFixture<TrialKartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrialKartaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialKartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
