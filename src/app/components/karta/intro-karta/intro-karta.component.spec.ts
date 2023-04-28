import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroKartaComponent } from './intro-karta.component';

describe('IntroKartaComponent', () => {
  let component: IntroKartaComponent;
  let fixture: ComponentFixture<IntroKartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntroKartaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroKartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
