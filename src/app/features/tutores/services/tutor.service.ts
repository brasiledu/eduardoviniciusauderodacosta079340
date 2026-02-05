import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Tutor, TutorResponse, TutorFilter } from '../models/tutor.model';

@Injectable({
  providedIn: 'root'
})
export class TutorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/tutores`;

  getAll(filter?: TutorFilter): Observable<TutorResponse> {
    let params = new HttpParams();
    
    if (filter?.nome) {
      params = params.set('nome', filter.nome);
    }
    if (filter?.cpf) {
      params = params.set('cpf', filter.cpf);
    }
    if (filter?.email) {
      params = params.set('email', filter.email);
    }
    if (filter?.page !== undefined) {
      params = params.set('page', filter.page.toString());
    }
    if (filter?.size !== undefined) {
      params = params.set('size', filter.size.toString());
    }

    return this.http.get<TutorResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Tutor> {
    return this.http.get<Tutor>(`${this.apiUrl}/${id}`);
  }

  create(tutor: Partial<Tutor>): Observable<Tutor> {
    return this.http.post<Tutor>(this.apiUrl, tutor);
  }

  update(id: number, tutor: Partial<Tutor>): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.apiUrl}/${id}`, tutor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
