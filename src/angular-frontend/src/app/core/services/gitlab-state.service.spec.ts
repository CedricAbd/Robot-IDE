import { TestBed } from '@angular/core/testing';

import { GitlabStateService } from './gitlab-state.service';

describe('GitlabStateService', () => {
  let service: GitlabStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GitlabStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
