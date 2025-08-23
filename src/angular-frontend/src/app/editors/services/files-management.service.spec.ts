import { TestBed } from '@angular/core/testing';

import { FilesManagementService } from './files-management.service';

describe('FilesManagementService', () => {
  let service: FilesManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilesManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
