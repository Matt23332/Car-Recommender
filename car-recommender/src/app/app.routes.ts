import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        component: AuthComponent
    },
    {
        path: 'dashboard',
        canActivate: [AuthGuard]
    },
    {
        path: 'booking',
        canActivate: [AuthGuard]
    },
    {
        path: 'admin',
        canActivate: [AuthGuard]
    },
    {
        path: 'cars',
        canActivate: [AuthGuard]
    }
];