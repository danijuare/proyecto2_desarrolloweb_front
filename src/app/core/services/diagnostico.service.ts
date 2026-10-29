import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diagnostico, OrdenTrabajoSelect, MecanicoSelect } from '../models/diagnostico.model';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticoService {
  private apiUrl = 'https://localhost:7073/api/Diagnosticos';
  private apiOrdenes = 'https://localhost:7073/api/OrdenesTrabajo';
  private apiMecanicos = 'https://localhost:7073/api/Mecanicos';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getDiagnosticos(): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getDiagnosticoById(id: number): Observable<Diagnostico> {
    return this.http.get<Diagnostico>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearDiagnostico(diagnostico: Diagnostico): Observable<Diagnostico> {
    return this.http.post<Diagnostico>(this.apiUrl, diagnostico, { headers: this.getHeaders() });
  }

  actualizarDiagnostico(id: number, diagnostico: Diagnostico): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, diagnostico, { headers: this.getHeaders() });
  }

  // Endpoints para alimentar los selectores
  getOrdenesTrabajo(): Observable<OrdenTrabajoSelect[]> {
    return this.http.get<OrdenTrabajoSelect[]>(this.apiOrdenes, { headers: this.getHeaders() });
  }

  getMecanicos(): Observable<MecanicoSelect[]> {
    return this.http.get<MecanicoSelect[]>(this.apiMecanicos, { headers: this.getHeaders() });
  }
}