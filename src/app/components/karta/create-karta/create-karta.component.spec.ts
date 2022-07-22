import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateKartaComponent } from './create-karta.component';

describe('CreateKartaComponent', () => {
  let component: CreateKartaComponent;
  let fixture: ComponentFixture<CreateKartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateKartaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateKartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
