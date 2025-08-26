import { TestBed } from '@angular/core/testing';

import { ThemeDefinitionService } from './theme-definition.service';

describe('ThemeDefinitionService', () => {
  let service: ThemeDefinitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeDefinitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
