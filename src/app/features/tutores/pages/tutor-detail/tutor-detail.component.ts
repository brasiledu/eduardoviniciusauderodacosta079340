import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TutorFacade } from '../../facades/tutor.facade';
import { Tutor } from '../../models/tutor.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
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
      <div *ngIf="loading" class="flex justify-center py-12">
        <app-loading-spinner size="lg" message="Carregando tutor..."></app-loading-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-red-700">{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Tutor Details -->
      <div *ngIf="tutor && !loading" class="bg-white rounded-xl shadow-md overflow-hidden">
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
            (click)="onDelete()"
            class="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
            Excluir
          </button>
        </div>
      </div>
    </div>
  `
})
export class TutorDetailComponent implements OnInit {
  private readonly tutorFacade = inject(TutorFacade);
  private readonly route = inject(ActivatedRoute);

  tutor?: Tutor;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTutor(+id);
    }
  }

  private loadTutor(id: number): void {
    this.loading = true;
    this.tutorFacade.getTutorById(id).subscribe({
      next: (tutor) => {
        this.tutor = tutor;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar tutor:', error);
        this.errorMessage = 'Erro ao carregar tutor. Tente novamente.';
        this.loading = false;
      }
    });
  }

  onDelete(): void {
    if (!this.tutor) return;
    
    if (confirm(`Tem certeza que deseja excluir o tutor ${this.tutor.nome}?`)) {
      this.tutorFacade.deleteTutor(this.tutor.id).subscribe({
        next: () => {
          window.history.back();
        },
        error: (error) => {
          console.error('Erro ao excluir tutor:', error);
          this.errorMessage = 'Erro ao excluir tutor. Tente novamente.';
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
