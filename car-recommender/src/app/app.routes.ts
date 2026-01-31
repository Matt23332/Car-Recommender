import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { DashboardComponent } from './features/dashboard/dashboard';
import { AuthGuard } from './core/guards/auth.guard';
import { CarListingComponent } from './features/cars/car-listing/car-listing';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth/login',
        component: AuthComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        //canActivate: [AuthGuard]
    },
    {
        path: 'car-listing',
        component: CarListingComponent
        //canActivate: [AuthGuard]
    }
];