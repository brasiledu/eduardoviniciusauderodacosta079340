import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TutorFacade } from '../../facades/tutor.facade';
import { PetFacade } from '../../../pets/facades/pet.facade';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Back Button -->
      <button 
        routerLink="/tutores"
        class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Voltar
      </button>

      <!-- Loading State -->
      <div *ngIf="detailLoading$ | async" class="flex justify-center py-12">
        <app-loading-spinner size="lg" message="Carregando tutor..."></app-loading-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="detailError$ | async as error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-red-700">{{ error }}</span>
        </div>
      </div>

      <!-- Tutor Details -->
      <div *ngIf="(selectedTutor$ | async) as tutor" class="space-y-6">
        
        <!-- Tutor Info Card -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mr-6">
                  <span class="text-3xl font-bold text-primary-700">
                    {{ tutor.nome.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <h1 class="text-3xl font-bold text-white">{{ tutor.nome }}</h1>
                  <p class="text-primary-100 mt-1">Tutor</p>
                </div>
              </div>
              <button 
                [routerLink]="['/tutores', tutor.id, 'editar']"
                class="bg-white text-primary-700 px-6 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors">
                Editar
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- CPF -->
              <div class="border-l-4 border-primary-500 pl-4">
                <p class="text-sm font-medium text-gray-500 mb-1">CPF</p>
                <p class="text-lg text-gray-900">{{ formatCPF(tutor.cpf) }}</p>
              </div>

              <!-- Email -->
              <div class="border-l-4 border-primary-500 pl-4">
                <p class="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p class="text-lg text-gray-900">{{ tutor.email }}</p>
              </div>

              <!-- Telefone -->
              <div class="border-l-4 border-primary-500 pl-4">
                <p class="text-sm font-medium text-gray-500 mb-1">Telefone</p>
                <p class="text-lg text-gray-900">{{ formatTelefone(tutor.telefone) }}</p>
              </div>

              <!-- Data de Cadastro -->
              <div class="border-l-4 border-primary-500 pl-4" *ngIf="tutor.dataCadastro">
                <p class="text-sm font-medium text-gray-500 mb-1">Data de Cadastro</p>
                <p class="text-lg text-gray-900">{{ formatDate(tutor.dataCadastro) }}</p>
              </div>

              <!-- Endereço -->
              <div class="border-l-4 border-primary-500 pl-4 md:col-span-2" *ngIf="tutor.endereco">
                <p class="text-sm font-medium text-gray-500 mb-1">Endereço</p>
                <p class="text-lg text-gray-900">{{ tutor.endereco }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-4">
            <button 
              [routerLink]="['/tutores', tutor.id, 'editar']"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Editar Tutor
            </button>
            <button 
              (click)="onDelete(tutor.id)"
              class="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
              Excluir
            </button>
          </div>
        </div>

        <!-- Pets Vinculados -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="px-8 py-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">Pets Vinculados</h2>
                <p class="text-gray-500 mt-1">Gerencie os pets deste tutor</p>
              </div>
              <button 
                (click)="showLinkPetModal = true"
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Vincular Pet
              </button>
            </div>
          </div>

          <!-- Lista de Pets -->
          <div class="p-8">
            <div *ngIf="(selectedTutorPets$ | async)?.length === 0" 
                 class="text-center py-12 bg-gray-50 rounded-lg">
              <svg class="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-700 mb-2">Nenhum pet vinculado</h3>
              <p class="text-gray-500 mb-4">Este tutor ainda não possui pets cadastrados</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                 *ngIf="(selectedTutorPets$ | async)?.length! > 0">
              <div *ngFor="let pet of selectedTutorPets$ | async" 
                   class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <!-- Pet Image -->
                <div class="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <img 
                    *ngIf="pet.foto?.url" 
                    [src]="pet.foto?.url!" 
                    [alt]="pet.nome"
                    class="w-full h-full object-cover"
                  />
                  <svg *ngIf="!pet.foto?.url" class="w-16 h-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <!-- Pet Info -->
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ pet.nome }}</h3>
                  <p class="text-sm text-gray-600 mb-3">{{ pet.raca }} - {{ pet.idade }} {{ pet.idade === 1 ? 'ano' : 'anos' }}</p>
                  <div class="flex items-center justify-between">
                    <button 
                      [routerLink]="['/pets', pet.id]"
                      class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Ver detalhes
                    </button>
                    <button 
                      (click)="onUnlinkPet(tutor.id, pet.id, pet.nome)"
                      class="text-sm text-red-600 hover:text-red-700 font-medium">
                      Desvincular
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Vincular Pet -->
      <div *ngIf="showLinkPetModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           (click)="showLinkPetModal = false">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-800">Vincular Pet ao Tutor</h3>
          </div>
          <div class="p-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Selecione um Pet
            </label>
            <select 
              [(ngModel)]="selectedPetId"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
              <option value="">Escolha um pet...</option>
              <option *ngFor="let pet of availablePets$ | async" [value]="pet.id">
                {{ pet.nome }} - {{ pet.especie }}
              </option>
            </select>
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button 
              (click)="showLinkPetModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button 
              (click)="onLinkPet()"
              [disabled]="!selectedPetId"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Vincular
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TutorDetailComponent implements OnInit, OnDestroy {
  private readonly tutorFacade = inject(TutorFacade);
  private readonly petFacade = inject(PetFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly selectedTutor$ = this.tutorFacade.selectedTutor$;
  readonly selectedTutorPets$ = this.tutorFacade.selectedTutorPets$;
  readonly detailLoading$ = this.tutorFacade.detailLoading$;
  readonly detailError$ = this.tutorFacade.detailError$;
  readonly availablePets$ = this.petFacade.pets$;

  showLinkPetModal = false;
  selectedPetId: number | string = '';
  tutorId: number = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tutorId = +id;
      this.tutorFacade.loadTutorDetails(this.tutorId);
      // Carrega todos os pets disponíveis
      this.petFacade.loadPets();
    }
  }

  ngOnDestroy(): void {
    this.tutorFacade.clearTutorDetails();
  }

  onLinkPet(): void {
    if (!this.selectedPetId) return;

    this.tutorFacade.linkPetToTutor(this.tutorId, +this.selectedPetId).subscribe({
      next: () => {
        this.showLinkPetModal = false;
        this.selectedPetId = '';
      },
      error: (error) => {
        alert('Erro ao vincular pet: ' + error.message);
      }
    });
  }

  onUnlinkPet(tutorId: number, petId: number, petName: string): void {
    if (confirm(`Tem certeza que deseja desvincular o pet ${petName}?`)) {
      this.tutorFacade.unlinkPetFromTutor(tutorId, petId).subscribe({
        next: () => {
          // Pet desvinculado com sucesso
        },
        error: (error) => {
          alert('Erro ao desvincular pet: ' + error.message);
        }
      });
    }
  }

  onDelete(id: number): void {
    if (confirm('Tem certeza que deseja excluir este tutor?')) {
      this.tutorFacade.deleteTutor(id).subscribe({
        next: () => {
          this.router.navigate(['/tutores']);
        },
        error: (error) => {
          alert('Erro ao excluir tutor: ' + error.message);
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

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
