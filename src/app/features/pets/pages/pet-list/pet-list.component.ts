import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PetFacade } from '../../facades/pet.facade';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Meus Pets</h1>
          <p class="text-gray-500 mt-1">Gerencie seus pets cadastrados</p>
        </div>
        <button 
          routerLink="/pets/novo"
          class="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Novo Pet
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative max-w-md">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            placeholder="Buscar por nome..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <button 
            *ngIf="searchTerm"
            (click)="clearSearch()"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center py-12">
        <app-loading-spinner size="lg" message="Carregando pets..."></app-loading-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-red-700">{{ error }}</span>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!(loading$ | async) && (pets$ | async)?.length === 0" 
           class="text-center py-12 bg-gray-50 rounded-lg">
        <svg class="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M20 12H4M12 4v16"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Nenhum pet encontrado</h3>
        <p class="text-gray-500 mb-4">Comece cadastrando seu primeiro pet!</p>
        <button 
          routerLink="/pets/novo"
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
          Cadastrar Pet
        </button>
      </div>

      <!-- Pet Cards Grid -->
      <div *ngIf="!(loading$ | async) && (pets$ | async)?.length! > 0" 
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let pet of pets$ | async" 
             class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <!-- Pet Image -->
          <div class="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <img 
              *ngIf="pet.foto" 
              [src]="pet.foto" 
              [alt]="pet.nome"
              class="w-full h-full object-cover"
            />
            <svg *ngIf="!pet.foto" class="w-20 h-20 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          
          <!-- Pet Info -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ pet.nome }}</h3>
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {{ pet.especie }}
              </span>
              <span *ngIf="pet.raca" class="ml-2">{{ pet.raca }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{ pet.idade }} {{ pet.idade === 1 ? 'ano' : 'anos' }}
            </div>
            
            <!-- Actions -->
            <div class="flex items-center justify-end mt-4 pt-4 border-t border-gray-100 space-x-2">
              <button 
                [routerLink]="['/pets', pet.id]"
                class="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Visualizar">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
              <button 
                [routerLink]="['/pets', pet.id, 'editar']"
                class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button 
                (click)="onDelete(pet.id)"
                class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="(totalPages$ | async)! > 1" 
           class="flex items-center justify-between mt-8 bg-white rounded-lg shadow px-4 py-3">
        <div class="text-sm text-gray-500">
          Página {{ (currentPage$ | async)! + 1 }} de {{ totalPages$ | async }}
          <span class="hidden sm:inline">• {{ totalElements$ | async }} pets encontrados</span>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            (click)="onPreviousPage()"
            [disabled]="(currentPage$ | async) === 0"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Anterior
          </button>
          <button 
            (click)="onNextPage()"
            [disabled]="(currentPage$ | async)! >= (totalPages$ | async)! - 1"
            class="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Próxima
          </button>
        </div>
      </div>
    </div>
  `
})
export class PetListComponent implements OnInit {
  private readonly petFacade = inject(PetFacade);

  // Observables do Facade
  readonly pets$ = this.petFacade.pets$;
  readonly loading$ = this.petFacade.loading$;
  readonly error$ = this.petFacade.error$;
  readonly totalElements$ = this.petFacade.totalElements$;
  readonly totalPages$ = this.petFacade.totalPages$;
  readonly currentPage$ = this.petFacade.currentPage$;

  searchTerm = '';
  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.petFacade.loadPets();
  }

  onSearch(): void {
    // Debounce de 300ms para evitar muitas requisições
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.petFacade.searchByName(this.searchTerm);
    }, 300);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.petFacade.clearFilters();
  }

  onPreviousPage(): void {
    this.petFacade.previousPage();
  }

  onNextPage(): void {
    this.petFacade.nextPage();
  }

  onDelete(id: number): void {
    if (confirm('Tem certeza que deseja excluir este pet?')) {
      this.petFacade.deletePet(id).subscribe();
    }
  }
}
