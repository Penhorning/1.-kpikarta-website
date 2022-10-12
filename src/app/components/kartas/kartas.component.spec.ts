import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KartasComponent } from './kartas.component';

describe('KartasComponent', () => {
  let component: KartasComponent;
  let fixture: ComponentFixture<KartasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KartasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KartasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
