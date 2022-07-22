import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KartaComponent } from './karta.component';

describe('KartaComponent', () => {
  let component: KartaComponent;
  let fixture: ComponentFixture<KartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KartaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
