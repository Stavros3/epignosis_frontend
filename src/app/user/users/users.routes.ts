import { Routes } from '@angular/router';

import { adminGuard } from 'src/app/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./users.component').then((m) => m.UsersComponent),
    canActivate: [adminGuard],
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }

];
