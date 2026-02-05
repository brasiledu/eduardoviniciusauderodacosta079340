import { Routes } from '@angular/router';

export const TUTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/tutor-list/tutor-list.component').then(m => m.TutorListComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./pages/tutor-form/tutor-form.component').then(m => m.TutorFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/tutor-detail/tutor-detail.component').then(m => m.TutorDetailComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/tutor-form/tutor-form.component').then(m => m.TutorFormComponent)
  }
];
