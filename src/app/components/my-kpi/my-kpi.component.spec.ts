import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyKpiComponent } from './my-kpi.component';

describe('MyKpiComponent', () => {
  let component: MyKpiComponent;
  let fixture: ComponentFixture<MyKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyKpiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
