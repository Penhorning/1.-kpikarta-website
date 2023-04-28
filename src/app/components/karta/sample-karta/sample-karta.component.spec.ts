import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleKartaComponent } from './sample-karta.component';

describe('SampleKartaComponent', () => {
  let component: SampleKartaComponent;
  let fixture: ComponentFixture<SampleKartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SampleKartaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleKartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
