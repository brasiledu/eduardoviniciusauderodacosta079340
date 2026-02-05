export interface Tutor {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco?: string;
  dataCadastro?: string;
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
