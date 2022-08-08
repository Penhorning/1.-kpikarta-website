import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditKartaComponent } from './edit-karta.component';

describe('EditKartaComponent', () => {
  let component: EditKartaComponent;
  let fixture: ComponentFixture<EditKartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditKartaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditKartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
