import { Routes } from '@angular/router';

export const PETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/pet-list/pet-list.component').then(m => m.PetListComponent)
  }
];
