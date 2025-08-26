import { TestBed } from '@angular/core/testing';

import { KeywordsGatheringService } from './keywords-gathering.service';

describe('KeywordsGatheringService', () => {
  let service: KeywordsGatheringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeywordsGatheringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
