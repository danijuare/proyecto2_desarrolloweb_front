import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoAccion } from '../models/estado-accion.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoAccionService {
  private apiUrl = 'https://localhost:7073/api/EstadosAccion';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getEstados(): Observable<EstadoAccion[]> {
    return this.http.get<EstadoAccion[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEstadoById(id: number): Observable<EstadoAccion> {
    return this.http.get<EstadoAccion>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearEstado(estado: EstadoAccion): Observable<EstadoAccion> {
    return this.http.post<EstadoAccion>(this.apiUrl, estado, { headers: this.getHeaders() });
  }

  actualizarEstado(id: number, estado: EstadoAccion): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, estado, { headers: this.getHeaders() });
  }
}