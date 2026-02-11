import { TestBed } from '@angular/core/testing';

import { EnvironmentProd } from './environment.prod';

describe('EnvironmentProd', () => {
  let service: EnvironmentProd;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentProd);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
