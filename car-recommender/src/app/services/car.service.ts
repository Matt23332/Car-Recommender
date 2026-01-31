import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CarModel, FilterCriteria } from '../models/car.model';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private readonly API_URL = 'http://localhost:3000/cars';

  private carsSubject = new BehaviorSubject<CarModel[]>([]);
  cars$ = this.carsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCars(filters?: FilterCriteria): Observable<CarModel[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.searchQuery) params = params.set('search', filters.searchQuery);
      if (filters.type && filters.type !== 'all') params = params.set('type', filters.type);
      if (filters.transmission && filters.transmission !== 'all') params = params.set('transmission', filters.transmission);
      if (filters.fuelType && filters.fuelType !== 'all') params = params.set('fuelType', filters.fuelType);
      if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.seats && filters.seats !== 'all') params = params.set('seats', filters.seats);
      if (filters.location) params = params.set('location', filters.location);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    }

    return this.http.get<CarModel[]>(`${this.API_URL}/cars`, { params }).pipe(
      map(cars => {
        this.carsSubject.next(cars);
        return cars;
      })
    );
  }

  getCarById(id: string): Observable<CarModel> {
    return this.http.get<CarModel>(`${this.API_URL}/cars/${id}`);
  }

  getFeaturedCars(): Observable<CarModel[]> {
    return this.http.get<CarModel[]>(`${this.API_URL}/cars/featured`);
  }

  getCarTypes(): string[] {
    return ['all', 'sedan', 'suv', 'truck', 'coupe', 'hatchback', 'van', 'wagon', 'other'];
  }

  getLocations(): string[] {
    return ['Karen', 'Westlands', 'Langata', 'Kilimani', 'Lavington', 'Runda', 'Gigiri', 'Other'];
  }
}
