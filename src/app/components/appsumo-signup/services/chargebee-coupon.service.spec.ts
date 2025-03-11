import { TestBed } from '@angular/core/testing';

import { ChargebeeService } from './chargebee-coupon.service';

describe('ChargebeeService', () => {
  let service: ChargebeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargebeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
