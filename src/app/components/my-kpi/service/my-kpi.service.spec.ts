import { TestBed } from '@angular/core/testing';

import { MyKpiService } from './my-kpi.service';

describe('MyKpiService', () => {
  let service: MyKpiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyKpiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
