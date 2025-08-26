import { TestBed } from '@angular/core/testing';

import { DataPersistenceService } from './data-persistence.service';

describe('DataPersistenceService', () => {
  let service: DataPersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataPersistenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
