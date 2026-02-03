import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Pet Manager</h1>
          <p class="text-gray-500 mt-2">Faça login para continuar</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="seu@email.com"
            />
            <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
               class="mt-1 text-sm text-red-500">
              E-mail inválido
            </p>
          </div>

          <div>
            <label for="senha" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              id="senha"
              type="password"
              formControlName="senha"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              [class.border-red-500]="loginForm.get('senha')?.invalid && loginForm.get('senha')?.touched"
              placeholder="••••••••"
            />
            <p *ngIf="loginForm.get('senha')?.invalid && loginForm.get('senha')?.touched" 
               class="mt-1 text-sm text-red-500">
              Senha é obrigatória
            </p>
          </div>

          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <app-loading-spinner *ngIf="isLoading" size="sm" containerClass="mr-2"></app-loading-spinner>
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(3)]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/pets']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      }
    });
  }
}
