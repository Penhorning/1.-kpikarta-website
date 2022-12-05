import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditKartaInventoryComponent } from './edit-karta-inventory.component';

describe('EditKartaInventoryComponent', () => {
  let component: EditKartaInventoryComponent;
  let fixture: ComponentFixture<EditKartaInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditKartaInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditKartaInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
