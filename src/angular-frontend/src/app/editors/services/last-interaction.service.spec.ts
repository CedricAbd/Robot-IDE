import { TestBed } from '@angular/core/testing';

import { LastInteractionService } from './last-interaction.service';

describe('LastInteractionService', () => {
  let service: LastInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
