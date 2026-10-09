import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repuesto } from '../models/repuesto.model';

@Injectable({
  providedIn: 'root'
})
export class RepuestoService {
  private apiUrl = 'https://localhost:7073/api/Repuestos';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getRepuestos(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getRepuestoById(id: number): Observable<Repuesto> {
    return this.http.get<Repuesto>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearRepuesto(repuesto: Repuesto): Observable<Repuesto> {
    return this.http.post<Repuesto>(this.apiUrl, repuesto, { headers: this.getHeaders() });
  }

  actualizarRepuesto(id: number, repuesto: Repuesto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, repuesto, { headers: this.getHeaders() });
  }
}