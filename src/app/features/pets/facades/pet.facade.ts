import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, finalize } from 'rxjs';
import { PetService } from '../services/pet.service';
import { Pet, PetFilter, PetResponse } from '../models/pet.model';

export interface PetState {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
}

const initialState: PetState = {
  pets: [],
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
export class PetFacade {
  private readonly petService = inject(PetService);
  
  // Estado privado com BehaviorSubject
  private readonly _state$ = new BehaviorSubject<PetState>(initialState);
  
  // Seletores públicos (Observables)
  readonly state$ = this._state$.asObservable();
  readonly pets$ = this._state$.pipe(map(state => state.pets));
  readonly loading$ = this._state$.pipe(map(state => state.loading));
  readonly error$ = this._state$.pipe(map(state => state.error));
  readonly totalElements$ = this._state$.pipe(map(state => state.totalElements));
  readonly totalPages$ = this._state$.pipe(map(state => state.totalPages));
  readonly currentPage$ = this._state$.pipe(map(state => state.currentPage));
  readonly pageSize$ = this._state$.pipe(map(state => state.pageSize));

  // Getter para acessar o estado atual
  private get state(): PetState {
    return this._state$.getValue();
  }

  // Atualiza o estado
  private setState(newState: Partial<PetState>): void {
    this._state$.next({ ...this.state, ...newState });
  }

  /**
   * Carrega a lista de pets com filtros opcionais
   */
  loadPets(filter?: PetFilter): void {
    this.setState({ loading: true, error: null });

    const searchFilter: PetFilter = {
      nome: filter?.nome ?? this.state.searchTerm,
      page: filter?.page ?? this.state.currentPage,
      size: filter?.size ?? this.state.pageSize
    };

    this.petService.getAll(searchFilter)
      .pipe(finalize(() => this.setState({ loading: false })))
      .subscribe({
        next: (response: PetResponse) => {
          this.setState({
            pets: response.content,
            totalElements: response.totalElements,
            totalPages: response.totalPages,
            currentPage: response.number
          });
        },
        error: (error) => {
          this.setState({ 
            error: error.message || 'Erro ao carregar pets',
            pets: []
          });
        }
      });
  }

  /**
   * Busca pets por nome
   */
  searchByName(searchTerm: string): void {
    this.setState({ searchTerm, currentPage: 0 });
    this.loadPets({ nome: searchTerm, page: 0 });
  }

  /**
   * Navega para uma página específica
   */
  goToPage(page: number): void {
    this.setState({ currentPage: page });
    this.loadPets({ page });
  }

  /**
   * Vai para a próxima página
   */
  nextPage(): void {
    if (this.state.currentPage < this.state.totalPages - 1) {
      this.goToPage(this.state.currentPage + 1);
    }
  }

  /**
   * Vai para a página anterior
   */
  previousPage(): void {
    if (this.state.currentPage > 0) {
      this.goToPage(this.state.currentPage - 1);
    }
  }

  /**
   * Altera o tamanho da página
   */
  changePageSize(size: number): void {
    this.setState({ pageSize: size, currentPage: 0 });
    this.loadPets({ size, page: 0 });
  }

  /**
   * Limpa os filtros e recarrega
   */
  clearFilters(): void {
    this.setState({ searchTerm: '', currentPage: 0 });
    this.loadPets({ nome: '', page: 0 });
  }

  /**
   * Deleta um pet e recarrega a lista
   */
  deletePet(id: number): Observable<void> {
    return this.petService.delete(id).pipe(
      finalize(() => this.loadPets())
    );
  }
}
