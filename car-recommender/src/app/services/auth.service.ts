import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserModel, LoginRequest, RegisterRequest, AuthResponse, TokenPayload } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5000/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject: BehaviorSubject<UserModel | null>;
  public currentUser$: Observable<UserModel | null>;

  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<UserModel | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!storedUser);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError),
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    // this.http.post(`${this.API_URL}/logout`, {}).subscribe({
    //   next: () => {},
    //   error: (error) => {}
    // });
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['auth/login']);
    console.log('User logged out');
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.setToken(response.token);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/reset-password`, { token, newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/verify-email`, { token }).pipe(
      catchError(this.handleError)
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/change-password`, { oldPassword, newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(data: Partial<UserModel>): Observable<UserModel> {
    return this.http.put<UserModel>(`${this.API_URL}/profile`, data).pipe(
      tap(user => {
        this.setUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleError)
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  private decodeToken(token: string): TokenPayload {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  get currentUserValue(): UserModel | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private getStoredUser(): UserModel | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private setUser(user: UserModel): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  //HELPER METHODS
  private handleAuthSuccess(response: AuthResponse): void {
    this.setToken(response.token);
    if (response.refreshToken) {
      this.setRefreshToken(response.refreshToken);
    }

    this.setUser(response.user);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'Not Found. The requested resource could not be found.';
          break;
        // case 500:
        //   errorMessage = 'Internal Server Error. Please try again later.';
        //   break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error('Auth error: ', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

