import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, finalize } from 'rxjs';
import { TutorService } from '../services/tutor.service';
import { Tutor, TutorFilter, TutorResponse } from '../models/tutor.model';

export interface TutorState {
  tutores: Tutor[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
}

const initialState: TutorState = {
  tutores: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  searchTerm: ''
};

@Injectable({
  providedIn: 'root'
})
export class TutorFacade {
  private readonly tutorService = inject(TutorService);
  
  // Estado privado com BehaviorSubject
  private readonly _state$ = new BehaviorSubject<TutorState>(initialState);
  
  // Seletores públicos (Observables)
  readonly state$ = this._state$.asObservable();
  readonly tutores$ = this._state$.pipe(map(state => state.tutores));
  readonly loading$ = this._state$.pipe(map(state => state.loading));
  readonly error$ = this._state$.pipe(map(state => state.error));
  readonly totalElements$ = this._state$.pipe(map(state => state.totalElements));
  readonly totalPages$ = this._state$.pipe(map(state => state.totalPages));
  readonly currentPage$ = this._state$.pipe(map(state => state.currentPage));
  readonly pageSize$ = this._state$.pipe(map(state => state.pageSize));

  // Getter para acessar o estado atual
  private get state(): TutorState {
    return this._state$.getValue();
  }

  // Setter para atualizar o estado
  private setState(newState: Partial<TutorState>): void {
    this._state$.next({ ...this.state, ...newState });
  }

  // Carregar todos os tutores
  loadTutores(filter?: TutorFilter): void {
    this.setState({ loading: true, error: null });
    
    const searchFilter: TutorFilter = {
      ...filter,
      nome: this.state.searchTerm || filter?.nome,
      page: filter?.page ?? this.state.currentPage,
      size: filter?.size ?? this.state.pageSize
    };

    this.tutorService.getAll(searchFilter)
      .pipe(
        finalize(() => this.setState({ loading: false }))
      )
      .subscribe({
        next: (response: TutorResponse) => {
          this.setState({
            tutores: response.content,
            totalElements: response.totalElements,
            totalPages: response.totalPages,
            currentPage: response.number,
            pageSize: response.size,
            error: null
          });
        },
        error: (error) => {
          this.setState({ 
            error: 'Erro ao carregar tutores. Tente novamente.',
            tutores: []
          });
          console.error('Erro ao carregar tutores:', error);
        }
      });
  }

  // Buscar tutor por ID
  getTutorById(id: number): Observable<Tutor> {
    return this.tutorService.getById(id);
  }

  // Criar novo tutor
  createTutor(tutor: Partial<Tutor>): Observable<Tutor> {
    this.setState({ loading: true, error: null });
    
    return this.tutorService.create(tutor)
      .pipe(
        finalize(() => {
          this.setState({ loading: false });
          this.loadTutores(); // Recarrega a lista
        })
      );
  }

  // Atualizar tutor existente
  updateTutor(id: number, tutor: Partial<Tutor>): Observable<Tutor> {
    this.setState({ loading: true, error: null });
    
    return this.tutorService.update(id, tutor)
      .pipe(
        finalize(() => {
          this.setState({ loading: false });
          this.loadTutores(); // Recarrega a lista
        })
      );
  }

  // Deletar tutor
  deleteTutor(id: number): Observable<void> {
    this.setState({ loading: true, error: null });
    
    return this.tutorService.delete(id)
      .pipe(
        finalize(() => {
          this.setState({ loading: false });
          this.loadTutores(); // Recarrega a lista
        })
      );
  }

  // Buscar tutores por nome
  searchTutores(searchTerm: string): void {
    this.setState({ searchTerm, currentPage: 0 });
    this.loadTutores();
  }

  // Limpar busca
  clearSearch(): void {
    this.setState({ searchTerm: '', currentPage: 0 });
    this.loadTutores();
  }

  // Mudar página
  changePage(page: number): void {
    this.setState({ currentPage: page });
    this.loadTutores();
  }

  // Mudar tamanho da página
  changePageSize(size: number): void {
    this.setState({ pageSize: size, currentPage: 0 });
    this.loadTutores();
  }

  // Resetar estado
  resetState(): void {
    this._state$.next(initialState);
  }
}
