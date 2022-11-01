import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllKartasComponent } from './all-kartas.component';

describe('AllKartasComponent', () => {
  let component: AllKartasComponent;
  let fixture: ComponentFixture<AllKartasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllKartasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllKartasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
