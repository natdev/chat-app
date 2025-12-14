import { TestBed } from '@angular/core/testing';

import { Subscribe } from './subscribe';

describe('Subscribe', () => {
  let service: Subscribe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Subscribe);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
