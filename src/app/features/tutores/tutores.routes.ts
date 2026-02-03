import { Routes } from '@angular/router';

export const TUTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/tutor-list/tutor-list.component').then(m => m.TutorListComponent)
  }
];
