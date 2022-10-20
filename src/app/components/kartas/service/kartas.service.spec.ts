import { TestBed } from '@angular/core/testing';

import { KartasService } from './kartas.service';

describe('KartasService', () => {
  let service: KartasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KartasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
