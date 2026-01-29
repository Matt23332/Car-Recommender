import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this.authService.isAuthenticated && !this.authService.isTokenExpired()) {
            const requiredRole = route.data['role'];

            if (requiredRole && !this.authService.hasRole(requiredRole)) {
                this.router.navigate(['unauthorized']);
                return false;
            }
            return true;
        }
        this.router.navigate(['auth/login'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }
}
