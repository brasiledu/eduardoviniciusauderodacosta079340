import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Lista de Pets</h1>
      <p class="text-gray-600">Carregando módulo de Pets (Lazy Loaded)...</p>
    </div>
  `
})
export class PetListComponent {}
