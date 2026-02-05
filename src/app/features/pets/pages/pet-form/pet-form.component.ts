import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PetFacade } from '../../facades/pet.facade';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Header -->
      <div class="mb-6">
        <button 
          routerLink="/pets"
          class="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Voltar para lista
        </button>
        <h1 class="text-3xl font-bold text-gray-800">
          {{ isEditMode ? 'Editar Pet' : 'Cadastrar Novo Pet' }}
        </h1>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <form [formGroup]="petForm" (ngSubmit)="onSubmit()">
          <!-- Nome -->
          <div class="mb-4">
            <label for="nome" class="block text-sm font-medium text-gray-700 mb-2">
              Nome <span class="text-red-500">*</span>
            </label>
            <input
              id="nome"
              type="text"
              formControlName="nome"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              [class.border-red-500]="isFieldInvalid('nome')"
              placeholder="Digite o nome do pet"
            />
            <p *ngIf="isFieldInvalid('nome')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('nome') }}
            </p>
          </div>

          <!-- Espécie -->
          <div class="mb-4">
            <label for="especie" class="block text-sm font-medium text-gray-700 mb-2">
              Espécie <span class="text-red-500">*</span>
            </label>
            <select
              id="especie"
              formControlName="especie"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              [class.border-red-500]="isFieldInvalid('especie')"
            >
              <option value="">Selecione uma espécie</option>
              <option value="Cachorro">Cachorro</option>
              <option value="Gato">Gato</option>
              <option value="Pássaro">Pássaro</option>
              <option value="Coelho">Coelho</option>
              <option value="Hamster">Hamster</option>
              <option value="Peixe">Peixe</option>
              <option value="Outros">Outros</option>
            </select>
            <p *ngIf="isFieldInvalid('especie')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('especie') }}
            </p>
          </div>

          <!-- Raça -->
          <div class="mb-4">
            <label for="raca" class="block text-sm font-medium text-gray-700 mb-2">
              Raça <span class="text-red-500">*</span>
            </label>
            <input
              id="raca"
              type="text"
              formControlName="raca"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              [class.border-red-500]="isFieldInvalid('raca')"
              placeholder="Digite a raça do pet"
            />
            <p *ngIf="isFieldInvalid('raca')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('raca') }}
            </p>
          </div>

          <!-- Idade -->
          <div class="mb-4">
            <label for="idade" class="block text-sm font-medium text-gray-700 mb-2">
              Idade (anos) <span class="text-red-500">*</span>
            </label>
            <input
              id="idade"
              type="number"
              formControlName="idade"
              min="0"
              max="50"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              [class.border-red-500]="isFieldInvalid('idade')"
              placeholder="Digite a idade do pet"
            />
            <p *ngIf="isFieldInvalid('idade')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('idade') }}
            </p>
          </div>

          <!-- Upload de Foto -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Foto do Pet
            </label>
            <div class="flex items-center space-x-4">
              <!-- Preview da foto -->
              <div class="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  *ngIf="photoPreview" 
                  [src]="photoPreview" 
                  alt="Preview"
                  class="h-full w-full object-cover"
                />
                <svg *ngIf="!photoPreview" class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <!-- Botão de upload -->
              <div class="flex-1">
                <label 
                  for="foto" 
                  class="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  Escolher foto
                </label>
                <input
                  id="foto"
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="hidden"
                />
                <p class="text-xs text-gray-500 mt-2">PNG, JPG até 5MB</p>
                <p *ngIf="selectedFile" class="text-xs text-gray-700 mt-1">
                  {{ selectedFile.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Botões de ação -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              routerLink="/pets"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="petForm.invalid || isSubmitting"
              class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!isSubmitting">{{ isEditMode ? 'Salvar' : 'Cadastrar' }}</span>
              <span *ngIf="isSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Mensagens de erro/sucesso -->
      <div *ngIf="errorMessage" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-red-700">{{ errorMessage }}</span>
        </div>
      </div>
    </div>
  `
})
export class PetFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly petFacade = inject(PetFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  petForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';
  selectedFile: File | null = null;
  photoPreview: string | null = null;
  petId: number | null = null;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.petForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      especie: ['', [Validators.required]],
      raca: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      idade: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      tutorId: [null]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.petId = Number(id);
      this.loadPetData(this.petId);
    }
  }

  private loadPetData(id: number): void {
    this.petFacade.loadPetDetails(id);
    this.petFacade.selectedPet$.subscribe(pet => {
      if (pet) {
        this.petForm.patchValue({
          nome: pet.nome,
          especie: pet.especie,
          raca: pet.raca,
          idade: pet.idade,
          tutorId: pet.tutorId
        });
        if (pet.foto) {
          this.photoPreview = pet.foto;
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validação de tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'A foto deve ter no máximo 5MB';
        return;
      }

      // Validação de tipo
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'O arquivo deve ser uma imagem';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const petData = this.petForm.value;

    const saveOperation = this.isEditMode && this.petId
      ? this.petFacade.updatePet(this.petId, petData)
      : this.petFacade.createPet(petData);

    saveOperation
      .pipe(
        switchMap(savedPet => {
          // Se há foto selecionada, faz upload
          if (this.selectedFile) {
            return this.petFacade.uploadPetFoto(savedPet.id, this.selectedFile);
          }
          return [savedPet];
        }),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/pets']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Erro ao salvar pet. Tente novamente.';
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.petForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.petForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo é obrigatório';
    if (field.errors['minlength']) return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength']) return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;

    return 'Campo inválido';
  }
}
