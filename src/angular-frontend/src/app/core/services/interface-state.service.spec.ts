import { TestBed } from '@angular/core/testing';

import { InterfaceStateService } from './interface-state.service';

describe('InterfaceStateService', () => {
  let service: InterfaceStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterfaceStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
