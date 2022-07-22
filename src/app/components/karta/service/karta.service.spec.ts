import { TestBed } from '@angular/core/testing';

import { KartaService } from './karta.service';

describe('KartaService', () => {
  let service: KartaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KartaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
