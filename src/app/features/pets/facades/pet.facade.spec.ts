import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PetFacade } from './pet.facade';
import { PetService } from '../services/pet.service';
import { TutorService } from '../../tutores/services/tutor.service';
import { Pet, PetResponse } from '../models/pet.model';
import { environment } from '../../../../environments/environment';

describe('PetFacade', () => {
  let facade: PetFacade;
  let httpMock: HttpTestingController;
  let petService: PetService;

  const mockPets: Pet[] = [
    {
      id: 1,
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      idade: 3,
      foto: 'http://example.com/rex.jpg',
      tutorId: 1
    },
    {
      id: 2,
      nome: 'Mia',
      especie: 'Gato',
      raca: 'Siamês',
      idade: 2,
      foto: 'http://example.com/mia.jpg'
    }
  ];

  const mockPetResponse: PetResponse = {
    content: mockPets,
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PetFacade, PetService, TutorService]
    });

    facade = TestBed.inject(PetFacade);
    httpMock = TestBed.inject(HttpTestingController);
    petService = TestBed.inject(PetService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('State Management with BehaviorSubject', () => {
    it('should initialize with empty state', (done) => {
      facade.state$.subscribe(state => {
        expect(state.pets).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.totalElements).toBe(0);
        expect(state.currentPage).toBe(0);
        done();
      });
    });

    it('should update BehaviorSubject state after loading pets', (done) => {
      // Arrange: Subscribe to state changes
      const states: any[] = [];
      facade.state$.subscribe(state => states.push(state));

      // Act: Load pets
      facade.loadPets();

      // Assert: Check loading state
      expect(states[1].loading).toBe(true);
      expect(states[1].pets).toEqual([]);

      // Simulate HTTP response
      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPetResponse);

      // Assert: Check loaded state
      setTimeout(() => {
        const finalState = states[states.length - 1];
        expect(finalState.loading).toBe(false);
        expect(finalState.pets).toEqual(mockPets);
        expect(finalState.totalElements).toBe(2);
        expect(finalState.totalPages).toBe(1);
        expect(finalState.error).toBeNull();
        done();
      });
    });

    it('should update error state when load fails', (done) => {
      const states: any[] = [];
      facade.state$.subscribe(state => states.push(state));

      facade.loadPets();

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=0&size=10`);
      req.error(new ProgressEvent('error'));

      setTimeout(() => {
        const finalState = states[states.length - 1];
        expect(finalState.loading).toBe(false);
        expect(finalState.error).toBeTruthy();
        expect(finalState.pets).toEqual([]);
        done();
      });
    });
  });

  describe('Observable Selectors', () => {
    it('should emit pets from pets$ selector', (done) => {
      facade.loadPets();

      facade.pets$.subscribe(pets => {
        if (pets.length > 0) {
          expect(pets).toEqual(mockPets);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=0&size=10`);
      req.flush(mockPetResponse);
    });

    it('should emit loading state from loading$ selector', (done) => {
      const loadingStates: boolean[] = [];
      
      facade.loading$.subscribe(loading => {
        loadingStates.push(loading);
        
        if (loadingStates.length === 3) {
          expect(loadingStates[0]).toBe(false); // Initial
          expect(loadingStates[1]).toBe(true);  // Loading
          expect(loadingStates[2]).toBe(false); // Loaded
          done();
        }
      });

      facade.loadPets();
      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=0&size=10`);
      req.flush(mockPetResponse);
    });
  });

  describe('Search and Filters', () => {
    it('should search pets by name', () => {
      facade.searchByName('Rex');

      const req = httpMock.expectOne(
        `${environment.apiUrl}/v1/pets?nome=Rex&page=0&size=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPetResponse);
    });

    it('should clear search and reload', () => {
      facade.searchByName('Rex');
      httpMock.expectOne(`${environment.apiUrl}/v1/pets?nome=Rex&page=0&size=10`)
        .flush(mockPetResponse);

      facade.clearFilters();

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?nome=&page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPetResponse);
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', () => {
      facade.nextPage();

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=1&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPetResponse);
    });

    it('should navigate to previous page', () => {
      facade.goToPage(1);
      httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=1&size=10`)
        .flush(mockPetResponse);

      facade.previousPage();

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPetResponse);
    });

    it('should change page size', () => {
      facade.changePageSize(20);

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=0&size=20`);
      expect(req.request.method).toBe('GET');
      req.flush({ ...mockPetResponse, size: 20 });
    });
  });

  describe('Pet Details', () => {
    it('should load pet details', (done) => {
      facade.loadPetDetails(1);

      facade.selectedPet$.subscribe(pet => {
        if (pet) {
          expect(pet.id).toBe(1);
          expect(pet.nome).toBe('Rex');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPets[0]);
    });

    it('should load pet details with tutor when tutorId exists', (done) => {
      const mockTutor = {
        id: 1,
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        telefone: '11999999999'
      };

      facade.loadPetDetails(1);

      facade.selectedTutor$.subscribe(tutor => {
        if (tutor) {
          expect(tutor.id).toBe(1);
          expect(tutor.nome).toBe('João Silva');
          done();
        }
      });

      // Pet request
      const petReq = httpMock.expectOne(`${environment.apiUrl}/v1/pets/1`);
      petReq.flush(mockPets[0]);

      // Tutor request (triggered by pet.tutorId)
      const tutorReq = httpMock.expectOne(`${environment.apiUrl}/v1/tutores/1`);
      tutorReq.flush(mockTutor);
    });

    it('should clear pet details', (done) => {
      facade.loadPetDetails(1);
      
      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets/1`);
      req.flush(mockPets[0]);

      facade.clearPetDetails();

      facade.selectedPet$.subscribe(pet => {
        expect(pet).toBeNull();
        done();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new pet', (done) => {
      const newPet: Partial<Pet> = {
        nome: 'Bolt',
        especie: 'Cachorro',
        raca: 'Pastor Alemão',
        idade: 1
      };

      facade.createPet(newPet).subscribe(pet => {
        expect(pet.id).toBe(3);
        expect(pet.nome).toBe('Bolt');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPet);
      req.flush({ id: 3, ...newPet } as Pet);
    });

    it('should update an existing pet', (done) => {
      const updatedPet: Partial<Pet> = {
        nome: 'Rex Updated',
        idade: 4
      };

      facade.updatePet(1, updatedPet).subscribe(pet => {
        expect(pet.id).toBe(1);
        expect(pet.nome).toBe('Rex Updated');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPet);
      req.flush({ ...mockPets[0], ...updatedPet });
    });

    it('should delete a pet and reload list', () => {
      facade.deletePet(1).subscribe();

      const deleteReq = httpMock.expectOne(`${environment.apiUrl}/v1/pets/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      // Should trigger a reload
      const loadReq = httpMock.expectOne(`${environment.apiUrl}/v1/pets?page=0&size=10`);
      loadReq.flush(mockPetResponse);
    });
  });

  describe('Photo Upload', () => {
    it('should upload pet photo', (done) => {
      const file = new File([''], 'pet.jpg', { type: 'image/jpeg' });

      facade.uploadPetFoto(1, file).subscribe(pet => {
        expect(pet.id).toBe(1);
        expect(pet.foto).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/pets/1/fotos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush({ ...mockPets[0], foto: 'http://example.com/new-photo.jpg' });
    });
  });
});
