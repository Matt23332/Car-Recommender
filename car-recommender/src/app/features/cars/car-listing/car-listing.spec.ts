import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarListing } from './car-listing';

describe('CarListing', () => {
  let component: CarListing;
  let fixture: ComponentFixture<CarListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
