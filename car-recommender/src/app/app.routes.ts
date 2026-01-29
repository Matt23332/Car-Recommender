import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { DashboardComponent } from './features/dashboard/dashboard';

export const routes: Routes = [
    {
        path: 'auth',
        component: AuthComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    }
];