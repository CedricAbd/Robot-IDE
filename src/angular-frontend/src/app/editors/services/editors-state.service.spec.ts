import { TestBed } from '@angular/core/testing';

import { EditorsStateService } from './editors-state.service';

describe('EditorsStateService', () => {
  let service: EditorsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditorsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
