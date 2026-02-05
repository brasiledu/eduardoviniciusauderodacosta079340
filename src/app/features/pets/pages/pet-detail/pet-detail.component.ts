import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PetFacade } from '../../facades/pet.facade';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header com botão de voltar -->
      <div class="mb-6">
        <button 
          routerLink="/pets"
          class="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Voltar para lista
        </button>
        <h1 class="text-3xl font-bold text-gray-800">Detalhes do Pet</h1>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center py-12">
        <app-loading-spinner size="lg" message="Carregando detalhes..."></app-loading-spinner>
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

      <!-- Pet Details -->
      <div *ngIf="!(loading$ | async) && (pet$ | async) as pet" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Card da Foto -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <img 
                *ngIf="pet.foto" 
                [src]="pet.foto" 
                [alt]="pet.nome"
                class="w-full h-full object-cover"
              />
              <svg *ngIf="!pet.foto" class="w-24 h-24 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div class="p-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ pet.nome }}</h2>
              <p class="text-gray-600">{{ pet.especie }}</p>
            </div>
          </div>
        </div>

        <!-- Informações do Pet -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Card de Informações Básicas -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Informações Básicas
            </h3>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nome</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ pet.nome }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Espécie</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ pet.especie }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Raça</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ pet.raca || 'Não informado' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Idade</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ pet.idade }} {{ pet.idade === 1 ? 'ano' : 'anos' }}</dd>
              </div>
              <div *ngIf="pet.dataCadastro">
                <dt class="text-sm font-medium text-gray-500">Data de Cadastro</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(pet.dataCadastro) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Card do Tutor (se existir) -->
          <div *ngIf="tutor$ | async as tutor" class="bg-white rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Informações do Tutor
            </h3>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nome</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ tutor.nome }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">CPF</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatCPF(tutor.cpf) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ tutor.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Telefone</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatTelefone(tutor.telefone) }}</dd>
              </div>
              <div *ngIf="tutor.endereco">
                <dt class="text-sm font-medium text-gray-500">Endereço</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ tutor.endereco }}</dd>
              </div>
            </dl>
            <div class="mt-4">
              <button 
                [routerLink]="['/tutores', tutor.id]"
                class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                Ver detalhes completos do tutor →
              </button>
            </div>
          </div>

          <!-- Ações -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Ações</h3>
            <div class="flex flex-wrap gap-3">
              <button 
                [routerLink]="['/pets', pet.id, 'editar']"
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar Pet
              </button>
              <button 
                (click)="onDelete()"
                class="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Excluir Pet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PetDetailComponent implements OnInit, OnDestroy {
  private readonly petFacade = inject(PetFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly pet$ = this.petFacade.selectedPet$;
  readonly tutor$ = this.petFacade.selectedTutor$;
  readonly loading$ = this.petFacade.detailLoading$;
  readonly error$ = this.petFacade.detailError$;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.petFacade.loadPetDetails(id);
    }
  }

  ngOnDestroy(): void {
    this.petFacade.clearPetDetails();
  }

  onDelete(): void {
    const petId = Number(this.route.snapshot.paramMap.get('id'));
    if (confirm('Tem certeza que deseja excluir este pet?')) {
      this.petFacade.deletePet(petId).subscribe({
        next: () => {
          this.router.navigate(['/pets']);
        },
        error: (error) => {
          alert('Erro ao excluir pet. Tente novamente.');
        }
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
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
}
