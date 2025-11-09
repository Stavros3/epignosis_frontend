import { Routes } from '@angular/router';
//import { nonAuthGuard } from './guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    data: { isRegister: false },
    //canActivate: [nonAuthGuard]
  },
];
