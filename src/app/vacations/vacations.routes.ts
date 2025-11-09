import { Routes } from '@angular/router';

//import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./list/vacations.component').then((m) => m.VacationsComponent),
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }

];
