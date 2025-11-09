import { Routes } from '@angular/router';

import { adminGuard, authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'users',
    loadChildren: () => import('./user/users/users.routes').then((m) => m.routes),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'vacations',
    loadChildren: () => import('./vacations/vacations.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
