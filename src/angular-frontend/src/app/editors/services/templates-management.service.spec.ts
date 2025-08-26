import { TestBed } from '@angular/core/testing';

import { TemplatesManagementService } from './templates-management.service';

describe('TemplatesManagementService', () => {
  let service: TemplatesManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplatesManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
