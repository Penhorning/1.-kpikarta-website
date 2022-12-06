import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditKartaHeaderComponent } from './edit-karta-header.component';

describe('EditKartaHeaderComponent', () => {
  let component: EditKartaHeaderComponent;
  let fixture: ComponentFixture<EditKartaHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditKartaHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditKartaHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
