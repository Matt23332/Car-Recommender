import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth/login',
        component: AuthComponent
    }
];