import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface HealthStatus {
  status: 'UP' | 'DOWN';
  timestamp: Date;
  apiUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly healthCheckUrl = `${environment.apiUrl}/actuator/health`;

  /**
   * Verifica se a API está respondendo (Liveness Check)
   * @returns Observable com o status da API
   */
  checkApiHealth(): Observable<HealthStatus> {
    return this.http.get<any>(this.healthCheckUrl).pipe(
      map(() => ({
        status: 'UP' as const,
        timestamp: new Date(),
        apiUrl: environment.apiUrl
      })),
      catchError(() => of({
        status: 'DOWN' as const,
        timestamp: new Date(),
        apiUrl: environment.apiUrl
      }))
    );
  }

  /**
   * Verifica continuamente o status da API
   * @param intervalMs Intervalo em milissegundos para verificar
   */
  monitorHealth(intervalMs: number = 30000): Observable<HealthStatus> {
    return new Observable(observer => {
      const checkHealth = () => {
        this.checkApiHealth().subscribe(status => observer.next(status));
      };

      checkHealth(); // Primeira verificação imediata
      const interval = setInterval(checkHealth, intervalMs);

      // Cleanup ao desinscrever
      return () => clearInterval(interval);
    });
  }
}
