import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DependenciaAccion, DependenciaAccionInput } from '../models/dependencia-accion.model';

@Injectable({
  providedIn: 'root'
})
export class DependenciaAccionService {
  private readonly apiUrl = `${environment.apiBaseUrl}/DependenciasAccion`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getDependencias(): Observable<DependenciaAccion[]> {
    return this.http.get<DependenciaAccion[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearDependencia(dependencia: DependenciaAccionInput): Observable<DependenciaAccion> {
    return this.http.post<DependenciaAccion>(this.apiUrl, dependencia, { headers: this.getHeaders() });
  }

  eliminarDependencia(idAccion: number, idPrerequisito: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idAccion}/${idPrerequisito}`, { headers: this.getHeaders() });
  }
}
