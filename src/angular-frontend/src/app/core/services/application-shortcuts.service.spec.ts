import { TestBed } from '@angular/core/testing';

import { ApplicationShortcutsService } from './application-shortcuts.service';

describe('ApplicationShortcutsService', () => {
  let service: ApplicationShortcutsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationShortcutsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
