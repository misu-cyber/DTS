import { TestBed } from '@angular/core/testing';

import { Libraries } from './libraries';

describe('Libraries', () => {
  let service: Libraries;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Libraries);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
