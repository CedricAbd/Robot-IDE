import { TestBed } from '@angular/core/testing';

import { StructureFetchingService } from './structure-fetching.service';

describe('StructureFetchingService', () => {
  let service: StructureFetchingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StructureFetchingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
