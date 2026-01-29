import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { DashboardComponent } from './features/dashboard/dashboard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth/login',
        component: AuthComponent
    },
    {
        path: 'auth/login',
        component: AuthComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    }
];