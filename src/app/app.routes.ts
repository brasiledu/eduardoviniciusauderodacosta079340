import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pets',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'pets',
    canActivate: [authGuard],
    loadChildren: () => import('./features/pets/pets.routes').then(m => m.PETS_ROUTES)
  },
  {
    path: 'tutores',
    canActivate: [authGuard],
    loadChildren: () => import('./features/tutores/tutores.routes').then(m => m.TUTORES_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'pets'
  }
];
