import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, finalize, tap, switchMap } from 'rxjs';
import { PetService } from '../services/pet.service';
import { Pet, PetFilter, PetResponse } from '../models/pet.model';
import { TutorService } from '../../tutores/services/tutor.service';
import { Tutor } from '../../tutores/models/tutor.model';

export interface PetDetailState {
  pet: Pet | null;
  tutor: Tutor | null;
  loading: boolean;
  error: string | null;
}

export interface PetState {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  // Estado para detalhes
  selectedPet: Pet | null;
  selectedTutor: Tutor | null;
  detailLoading: boolean;
  detailError: string | null;
}

const initialState: PetState = {
  pets: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  searchTerm: '',
  selectedPet: null,
  selectedTutor: null,
  detailLoading: false,
  detailError: null
};

@Injectable({
  providedIn: 'root'
})
export class PetFacade {
  private readonly petService = inject(PetService);
  private readonly tutorService = inject(TutorService);
  
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
  
  // Seletores para detalhes
  readonly selectedPet$ = this._state$.pipe(map(state => state.selectedPet));
  readonly selectedTutor$ = this._state$.pipe(map(state => state.selectedTutor));
  readonly detailLoading$ = this._state$.pipe(map(state => state.detailLoading));
  readonly detailError$ = this._state$.pipe(map(state => state.detailError));

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

  /**
   * Carrega os detalhes de um pet pelo ID
   * Se o pet tiver tutorId, também carrega os dados do tutor
   */
  loadPetDetails(id: number): void {
    this.setState({ detailLoading: true, detailError: null, selectedPet: null, selectedTutor: null });

    this.petService.getById(id)
      .pipe(
        tap(pet => this.setState({ selectedPet: pet })),
        switchMap(pet => {
          // Se o pet tem tutorId, busca os dados do tutor
          if (pet.tutorId) {
            return this.tutorService.getById(pet.tutorId).pipe(
              tap(tutor => this.setState({ selectedTutor: tutor }))
            );
          }
          return [];
        }),
        finalize(() => this.setState({ detailLoading: false }))
      )
      .subscribe({
        error: (error) => {
          this.setState({ 
            detailError: error.message || 'Erro ao carregar detalhes do pet',
            detailLoading: false
          });
        }
      });
  }

  /**
   * Cria um novo pet
   */
  createPet(pet: Partial<Pet>): Observable<Pet> {
    return this.petService.create(pet);
  }

  /**
   * Atualiza um pet existente
   */
  updatePet(id: number, pet: Partial<Pet>): Observable<Pet> {
    return this.petService.update(id, pet);
  }

  /**
   * Faz upload da foto do pet
   */
  uploadPetFoto(petId: number, foto: File): Observable<Pet> {
    return this.petService.uploadFoto(petId, foto);
  }

  /**
   * Limpa os dados de detalhes
   */
  clearPetDetails(): void {
    this.setState({ 
      selectedPet: null, 
      selectedTutor: null, 
      detailError: null 
    });
  }
}
