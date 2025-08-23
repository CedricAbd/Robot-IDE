import { TestBed } from '@angular/core/testing';

import { NodesFilteringService } from './nodes-filtering.service';

describe('NodesFilteringService', () => {
  let service: NodesFilteringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodesFilteringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
