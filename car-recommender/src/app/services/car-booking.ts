import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { UserModel, CarModel, ApiResponse, Booking, LoginRequest, RegisterRequest, AuthResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class CarBookingService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuth();
  }

  // Authentication Methods
  register(userData: RegisterRequest): Observable<ApiResponse<{ token: string; user: UserModel }>> {
      return this.http.post<ApiResponse<{ token: string; user: UserModel }>>(
        `${this.apiUrl}/auth/register`, userData).pipe(
        tap((response) => {
          if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
    }
  
    login(credentials: LoginRequest): Observable<ApiResponse<{ token: string; user: UserModel }>> {
      return this.http.post<ApiResponse<{ token: string; user: UserModel }>>(
        `${this.apiUrl}/auth/login`,
        credentials
      ).pipe(
        tap((response) => {
          if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
    }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  checkAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.getCurrentUser().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data);
          }
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  getCurrentUser(): Observable<ApiResponse<UserModel>> {
    return this.http.get<ApiResponse<UserModel>>(`${this.apiUrl}/auth/me`);
  }

  updateProfile(profileData: Partial<UserModel>): Observable<ApiResponse<UserModel>> {
    return this.http.put<ApiResponse<UserModel>>(`${this.apiUrl}/auth/profile`, profileData);
  }

  updatePassword(passwords: { currentPassword: string; newPassword: string }): Observable<ApiResponse<{ token: string }>> {
    return this.http.put<ApiResponse<{ token: string }>>(
      `${this.apiUrl}/auth/password`,
      passwords
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUserValue(): UserModel | null {
    return this.currentUserSubject.value;
  }

  // Cars
  getCars(filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    transmission?: string;
    fuelType?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Observable<ApiResponse<CarModel[]>> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<CarModel[]>>(`${this.apiUrl}/cars`, { params });
  }

  getCar(id: string): Observable<ApiResponse<CarModel>> {
    return this.http.get<ApiResponse<CarModel>>(`${this.apiUrl}/cars/${id}`);
  }

  searchCars(searchParams: {
    keyword?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    transmission?: string;
    fuelType?: string;
  }): Observable<ApiResponse<CarModel[]>> {
    let params = new HttpParams();
    Object.keys(searchParams).forEach(key => {
      const value = searchParams[key as keyof typeof searchParams];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<ApiResponse<CarModel[]>>(`${this.apiUrl}/cars/search`, { params });
  }

  createCar(carData: Partial<CarModel>): Observable<ApiResponse<CarModel>> {
    return this.http.post<ApiResponse<CarModel>>(`${this.apiUrl}/cars`, carData);
  }

  updateCar(id: string, carData: Partial<CarModel>): Observable<ApiResponse<CarModel>> {
    return this.http.put<ApiResponse<CarModel>>(`${this.apiUrl}/cars/${id}`, carData);
  }

  deleteCar(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/cars/${id}`);
  }

  getFeaturedCars(): Observable<CarModel[]> {
    return this.http.get<CarModel[]>(`${this.apiUrl}/featured`);
  }

  getCarTypes(): string[] {
    return ['all', 'sedan', 'suv', 'truck', 'coupe', 'hatchback', 'van', 'wagon', 'other'];
  }

  getLocations(): string[] {
    return ['Karen', 'Westlands', 'Langata', 'Kilimani', 'Lavington', 'Runda', 'Gigiri', 'Other'];
  }

  // Bookings
  createBooking(bookingData: Partial<Booking>): Observable<ApiResponse<Booking>> {
  return this.http.post<ApiResponse<Booking>>(`${this.apiUrl}/bookings`, bookingData);
  }

  getBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.apiUrl}/bookings`);
  }

  getBooking(id: string): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.apiUrl}/bookings/${id}`);
  }

  updateBooking(id: string, bookingData: Partial<Booking>): Observable<ApiResponse<Booking>> {
    return this.http.put<ApiResponse<Booking>>(`${this.apiUrl}/bookings/${id}`, bookingData);
  }

  cancelBooking(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/bookings/${id}/cancel`, {});
  }

  deleteBooking(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/bookings/${id}`);
  }

  // Payments
  createPaymentIntent(bookingId: string): Observable<ApiResponse<{ clientSecret: string }>> {
    return this.http.post<ApiResponse<{ clientSecret: string; paymentIntentId: string }>>(
      `${this.apiUrl}/payments/create-intent`,
      { bookingId }
    );
  }

  confirmPayment(paymentIntentId: string, bookingId: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(
      `${this.apiUrl}/payments/confirm-payment`,
      { paymentIntentId, bookingId }
    );
  }

  processRefund(bookingId: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(
      `${this.apiUrl}/payments/refund`,
      { bookingId }
    );
  }

  // Utility Methods
  calculateBookingPrice(pricePerDay: number, startDate: Date, endDate: Date, addOns?: { insurance?: number; gps?: number; childSeat?: number; extraDriver?: number }): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let totalAmount = totalDays * pricePerDay;

    if (addOns) {
      totalAmount += Object.values(addOns).reduce((sum, charge) => sum + (charge || 0), 0);
    }

    return totalAmount;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);
  }
}
