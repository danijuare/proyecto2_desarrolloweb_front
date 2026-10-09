import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mecanico } from '../models/mecanico.model';

@Injectable({
  providedIn: 'root'
})
export class MecanicoService {
  private apiUrl = 'https://localhost:7073/api/Mecanicos';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getMecanicos(): Observable<Mecanico[]> {
    return this.http.get<Mecanico[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getMecanicoById(id: number): Observable<Mecanico> {
    return this.http.get<Mecanico>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearMecanico(mecanico: Mecanico): Observable<Mecanico> {
    return this.http.post<Mecanico>(this.apiUrl, mecanico, { headers: this.getHeaders() });
  }

  actualizarMecanico(id: number, mecanico: Mecanico): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, mecanico, { headers: this.getHeaders() });
  }

  desactivarMecanico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}