import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permiso, PermisoInput } from '../models/permiso.model';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Permisos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getPermisos(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearPermiso(permiso: PermisoInput): Observable<Permiso> {
    return this.http.post<Permiso>(this.apiUrl, permiso, { headers: this.getHeaders() });
  }

  actualizarPermiso(id: number, permiso: PermisoInput): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, permiso, { headers: this.getHeaders() });
  }

  desactivarPermiso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
