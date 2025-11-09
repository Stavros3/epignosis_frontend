import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken()) {
    return true;
  }

  const redirectTo = state.url && state.url !== '/auth/login' ? state.url : undefined;
  return redirectTo
    ? router.createUrlTree(['/auth/login'], { queryParams: { redirectTo } })
    : router.createUrlTree(['/auth/login']);
};

export const nonAuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasToken()) {
    return true;
  }

  return router.createUrlTree(['/home']);
};

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.user();

  if (user?.roles_id === 1) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
