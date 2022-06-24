import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySuggestionComponent } from './my-suggestion.component';

describe('MySuggestionComponent', () => {
  let component: MySuggestionComponent;
  let fixture: ComponentFixture<MySuggestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MySuggestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MySuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
