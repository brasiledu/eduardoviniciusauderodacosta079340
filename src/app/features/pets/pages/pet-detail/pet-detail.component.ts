import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Detalhes do Pet</h1>
      <p class="text-gray-600">Em desenvolvimento...</p>
    </div>
  `
})
export class PetDetailComponent {}
