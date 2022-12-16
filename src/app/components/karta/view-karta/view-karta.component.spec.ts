import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewKartaComponent } from './view-karta.component';

describe('ViewKartaComponent', () => {
  let component: ViewKartaComponent;
  let fixture: ComponentFixture<ViewKartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewKartaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewKartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
