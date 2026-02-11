import { TestBed } from '@angular/core/testing';

import { environment } from './environment';

describe('environment', () => {
  let env: typeof environment;

  beforeEach(() => {
    env = environment;
  });

  it('should be defined', () => {
    expect(env).toBeTruthy();
  });
});
