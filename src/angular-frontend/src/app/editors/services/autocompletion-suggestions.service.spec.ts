import { TestBed } from '@angular/core/testing';

import { AutocompletionSuggestionsService } from './autocompletion-suggestions.service';

describe('AutocompletionSuggestionsService', () => {
  let service: AutocompletionSuggestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutocompletionSuggestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
