import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { DashboardComponent } from './features/dashboard/dashboard';
import { AuthGuard } from './core/guards/auth.guard';
import { CarListingComponent } from './features/cars/car-listing/car-listing';
import { CarDetailsComponent } from './features/cars/car-details/car-details';
import { UserDashboardComponent } from './features/user/user';

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
        path: 'cars',
        component: CarListingComponent
        //canActivate: [AuthGuard]
    },
    {
        path: 'cars/:id',
        component: CarDetailsComponent
        //canActivate: [AuthGuard]
    },
    {
        path: 'user',
        component: UserDashboardComponent
        //canActivate: [AuthGuard]
    }
];