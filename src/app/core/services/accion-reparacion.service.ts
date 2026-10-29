import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccionReparacion } from '../models/accion-reparacion.model';
import { DiagnosticoSelect, EstadoAccion, UsuarioSelect } from '../models/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class AccionReparacionService {
  private apiUrl = 'https://localhost:7073/api/AccionesReparacion';
  private apiDiagnosticos = 'https://localhost:7073/api/Diagnosticos';
  private apiEstados = 'https://localhost:7073/api/EstadosAccion';
  private apiUsuarios = 'https://localhost:7073/api/Usuarios';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAcciones(): Observable<AccionReparacion[]> {
    return this.http.get<AccionReparacion[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getAccionById(id: number): Observable<AccionReparacion> {
    return this.http.get<AccionReparacion>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearAccion(accion: AccionReparacion): Observable<AccionReparacion> {
    return this.http.post<AccionReparacion>(this.apiUrl, accion, { headers: this.getHeaders() });
  }

  actualizarAccion(id: number, accion: AccionReparacion): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, accion, { headers: this.getHeaders() });
  }

  // Endpoints para alimentar los Selects
  getDiagnosticos(): Observable<DiagnosticoSelect[]> {
    return this.http.get<DiagnosticoSelect[]>(this.apiDiagnosticos, { headers: this.getHeaders() });
  }

  getEstadosAccion(): Observable<EstadoAccion[]> {
    return this.http.get<EstadoAccion[]>(this.apiEstados, { headers: this.getHeaders() });
  }

  getUsuarios(): Observable<UsuarioSelect[]> {
    return this.http.get<UsuarioSelect[]>(this.apiUsuarios, { headers: this.getHeaders() });
  }
}