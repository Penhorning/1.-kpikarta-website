import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditKartaPropertyComponent } from './edit-karta-property.component';

describe('EditKartaPropertyComponent', () => {
  let component: EditKartaPropertyComponent;
  let fixture: ComponentFixture<EditKartaPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditKartaPropertyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditKartaPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
