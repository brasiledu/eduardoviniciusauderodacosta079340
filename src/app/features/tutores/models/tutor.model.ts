export interface PetVinculado {
  id: number;
  nome: string;
  raca: string;
  idade: number;
  foto?: {
    id: number;
    nome: string;
    contentType: string;
    url: string;
  };
}

export interface Tutor {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco?: string;
  dataCadastro?: string;
  foto?: {
    id: number;
    nome: string;
    contentType: string;
    url: string;
  };
  pets?: PetVinculado[];
}

export interface TutorResponse {
  content: Tutor[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TutorFilter {
  nome?: string;
  cpf?: string;
  email?: string;
  page?: number;
  size?: number;
}
