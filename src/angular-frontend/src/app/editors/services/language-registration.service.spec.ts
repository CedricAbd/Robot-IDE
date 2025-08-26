import { TestBed } from '@angular/core/testing';

import { LanguageRegistrationService } from './language-registration.service';

describe('LanguageRegistrationService', () => {
  let service: LanguageRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
