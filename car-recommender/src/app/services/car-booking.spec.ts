import { TestBed } from '@angular/core/testing';

import { CarBooking } from './car-booking';

describe('CarBooking', () => {
  let service: CarBooking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarBooking);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
