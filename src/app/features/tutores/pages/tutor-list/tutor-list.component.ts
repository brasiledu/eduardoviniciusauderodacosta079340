import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TutorFacade } from '../../facades/tutor.facade';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-tutor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Tutores</h1>
          <p class="text-gray-500 mt-1">Gerencie os tutores cadastrados</p>
        </div>
        <button 
          routerLink="/tutores/novo"
          class="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Novo Tutor
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
        <app-loading-spinner size="lg" message="Carregando tutores..."></app-loading-spinner>
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
      <div *ngIf="!(loading$ | async) && (tutores$ | async)?.length === 0" 
           class="text-center py-12 bg-gray-50 rounded-lg">
        <svg class="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Nenhum tutor encontrado</h3>
        <p class="text-gray-500 mb-4">Comece cadastrando o primeiro tutor!</p>
        <button 
          routerLink="/tutores/novo"
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
          Cadastrar Tutor
        </button>
      </div>

      <!-- Tutores Table -->
      <div *ngIf="!(loading$ | async) && (tutores$ | async)?.length! > 0" 
           class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let tutor of tutores$ | async" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span class="text-primary-700 font-semibold text-sm">
                        {{ tutor.nome.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ tutor.nome }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatCPF(tutor.cpf) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ tutor.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatTelefone(tutor.telefone) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    [routerLink]="['/tutores', tutor.id]"
                    class="text-primary-600 hover:text-primary-900 mr-4"
                    title="Ver detalhes">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button 
                    [routerLink]="['/tutores', tutor.id, 'editar']"
                    class="text-blue-600 hover:text-blue-900 mr-4"
                    title="Editar">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button 
                    (click)="onDelete(tutor)"
                    class="text-red-600 hover:text-red-900"
                    title="Excluir">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Mostrando 
              <span class="font-medium">{{ (currentPage * pageSize) + 1 }}</span>
              até
              <span class="font-medium">{{ min((currentPage + 1) * pageSize, totalElements) }}</span>
              de
              <span class="font-medium">{{ totalElements }}</span>
              resultados
            </div>
            <div class="flex gap-2">
              <button
                [disabled]="currentPage === 0"
                (click)="onPageChange(currentPage - 1)"
                [class.opacity-50]="currentPage === 0"
                [class.cursor-not-allowed]="currentPage === 0"
                class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:hover:bg-white">
                Anterior
              </button>
              <button
                [disabled]="currentPage >= totalPages - 1"
                (click)="onPageChange(currentPage + 1)"
                [class.opacity-50]="currentPage >= totalPages - 1"
                [class.cursor-not-allowed]="currentPage >= totalPages - 1"
                class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:hover:bg-white">
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TutorListComponent implements OnInit {
  private readonly tutorFacade = inject(TutorFacade);

  // Observables do estado
  readonly tutores$ = this.tutorFacade.tutores$;
  readonly loading$ = this.tutorFacade.loading$;
  readonly error$ = this.tutorFacade.error$;
  readonly totalElements$ = this.tutorFacade.totalElements$;
  readonly totalPages$ = this.tutorFacade.totalPages$;
  readonly currentPage$ = this.tutorFacade.currentPage$;
  readonly pageSize$ = this.tutorFacade.pageSize$;

  searchTerm = '';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.tutorFacade.loadTutores();
    
    // Subscribe to state changes
    this.currentPage$.subscribe(page => this.currentPage = page);
    this.pageSize$.subscribe(size => this.pageSize = size);
    this.totalElements$.subscribe(total => this.totalElements = total);
    this.totalPages$.subscribe(pages => this.totalPages = pages);
  }

  onSearch(): void {
    this.tutorFacade.searchTutores(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.tutorFacade.clearSearch();
  }

  onPageChange(page: number): void {
    this.tutorFacade.changePage(page);
  }

  onDelete(tutor: any): void {
    if (confirm(`Tem certeza que deseja excluir o tutor ${tutor.nome}?`)) {
      this.tutorFacade.deleteTutor(tutor.id).subscribe({
        next: () => {
          console.log('Tutor excluído com sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir tutor:', error);
          alert('Erro ao excluir tutor. Tente novamente.');
        }
      });
    }
  }

  formatCPF(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatTelefone(telefone: string): string {
    if (!telefone) return '';
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
