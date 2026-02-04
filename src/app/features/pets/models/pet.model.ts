export interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  foto?: string;
  tutorId?: number;
  tutorNome?: string;
  dataCadastro?: string;
}

export interface PetResponse {
  content: Pet[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PetFilter {
  nome?: string;
  especie?: string;
  page?: number;
  size?: number;
}
