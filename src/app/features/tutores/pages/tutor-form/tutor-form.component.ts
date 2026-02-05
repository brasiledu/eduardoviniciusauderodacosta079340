import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TutorFacade } from '../../facades/tutor.facade';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-tutor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Header -->
      <div class="mb-8">
        <button 
          routerLink="/tutores"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Voltar
        </button>
        <h1 class="text-3xl font-bold text-gray-800">{{ isEditMode ? 'Editar Tutor' : 'Novo Tutor' }}</h1>
        <p class="text-gray-500 mt-1">{{ isEditMode ? 'Atualize as informações do tutor' : 'Cadastre um novo tutor no sistema' }}</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <app-loading-spinner size="lg" [message]="isEditMode ? 'Carregando tutor...' : 'Salvando...'"></app-loading-spinner>
      </div>

      <!-- Form -->
      <form *ngIf="!loading" [formGroup]="tutorForm" (ngSubmit)="onSubmit()" class="bg-white rounded-xl shadow-md p-6 space-y-6">
        <!-- Nome -->
        <div>
          <label for="nome" class="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            id="nome"
            type="text"
            formControlName="nome"
            placeholder="Digite o nome completo"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            [class.border-red-500]="tutorForm.get('nome')?.invalid && tutorForm.get('nome')?.touched"
          />
          <p *ngIf="tutorForm.get('nome')?.invalid && tutorForm.get('nome')?.touched" 
             class="mt-1 text-sm text-red-600">
            Nome é obrigatório
          </p>
        </div>

        <!-- CPF -->
        <div>
          <label for="cpf" class="block text-sm font-medium text-gray-700 mb-2">
            CPF *
          </label>
          <input
            id="cpf"
            type="text"
            formControlName="cpf"
            placeholder="000.000.000-00"
            maxlength="14"
            (input)="formatCPF($event)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            [class.border-red-500]="tutorForm.get('cpf')?.invalid && tutorForm.get('cpf')?.touched"
          />
          <p *ngIf="tutorForm.get('cpf')?.invalid && tutorForm.get('cpf')?.touched" 
             class="mt-1 text-sm text-red-600">
            CPF é obrigatório
          </p>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            placeholder="exemplo@email.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            [class.border-red-500]="tutorForm.get('email')?.invalid && tutorForm.get('email')?.touched"
          />
          <p *ngIf="tutorForm.get('email')?.hasError('required') && tutorForm.get('email')?.touched" 
             class="mt-1 text-sm text-red-600">
            Email é obrigatório
          </p>
          <p *ngIf="tutorForm.get('email')?.hasError('email') && tutorForm.get('email')?.touched" 
             class="mt-1 text-sm text-red-600">
            Email inválido
          </p>
        </div>

        <!-- Telefone -->
        <div>
          <label for="telefone" class="block text-sm font-medium text-gray-700 mb-2">
            Telefone *
          </label>
          <input
            id="telefone"
            type="tel"
            formControlName="telefone"
            placeholder="(00) 00000-0000"
            maxlength="15"
            (input)="formatTelefone($event)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            [class.border-red-500]="tutorForm.get('telefone')?.invalid && tutorForm.get('telefone')?.touched"
          />
          <p *ngIf="tutorForm.get('telefone')?.invalid && tutorForm.get('telefone')?.touched" 
             class="mt-1 text-sm text-red-600">
            Telefone é obrigatório
          </p>
        </div>

        <!-- Endereço -->
        <div>
          <label for="endereco" class="block text-sm font-medium text-gray-700 mb-2">
            Endereço
          </label>
          <textarea
            id="endereco"
            formControlName="endereco"
            rows="3"
            placeholder="Digite o endereço completo (opcional)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-red-700">{{ errorMessage }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            [disabled]="tutorForm.invalid || loading"
            class="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            {{ isEditMode ? 'Atualizar' : 'Cadastrar' }}
          </button>
          <button
            type="button"
            routerLink="/tutores"
            class="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `
})
export class TutorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tutorFacade = inject(TutorFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  tutorForm!: FormGroup;
  isEditMode = false;
  tutorId?: number;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.tutorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      endereco: ['']
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tutorId = +id;
      this.loadTutor(this.tutorId);
    }
  }

  private loadTutor(id: number): void {
    this.loading = true;
    this.tutorFacade.getTutorById(id).subscribe({
      next: (tutor) => {
        this.tutorForm.patchValue({
          nome: tutor.nome,
          cpf: this.formatCPFValue(tutor.cpf),
          email: tutor.email,
          telefone: this.formatTelefoneValue(tutor.telefone),
          endereco: tutor.endereco || ''
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar tutor:', error);
        this.errorMessage = 'Erro ao carregar tutor. Tente novamente.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.tutorForm.invalid) {
      this.tutorForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const tutorData = {
      ...this.tutorForm.value,
      cpf: this.tutorForm.value.cpf.replace(/\D/g, ''),
      telefone: this.tutorForm.value.telefone.replace(/\D/g, '')
    };

    const operation = this.isEditMode
      ? this.tutorFacade.updateTutor(this.tutorId!, tutorData)
      : this.tutorFacade.createTutor(tutorData);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/tutores']);
      },
      error: (error) => {
        console.error('Erro ao salvar tutor:', error);
        this.errorMessage = error.error?.message || 'Erro ao salvar tutor. Tente novamente.';
        this.loading = false;
      }
    });
  }

  formatCPF(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    }
    
    this.tutorForm.patchValue({ cpf: value }, { emitEvent: false });
  }

  formatTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    if (value.length > 10) {
      value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    this.tutorForm.patchValue({ telefone: value }, { emitEvent: false });
  }

  private formatCPFValue(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private formatTelefoneValue(telefone: string): string {
    if (!telefone) return '';
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
}
