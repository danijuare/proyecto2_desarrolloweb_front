import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioPermisos } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioPermisoService {
  private readonly apiUrl = `${environment.apiBaseUrl}/UsuariosPermisos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getPermisos(idUsuario: number): Observable<UsuarioPermisos> {
    return this.http.get<UsuarioPermisos>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }

  asignarPermiso(idUsuario: number, idPermiso: number, tipo: 'conceder' | 'denegar'): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/asignar`, {
      id_usuario: idUsuario,
      id_permiso: idPermiso,
      tipo
    }, { headers: this.getHeaders() });
  }

  desasignarPermiso(idUsuario: number, idPermiso: number): Observable<void> {
    return this.http.request<void>('delete', `${this.apiUrl}/desasignar`, {
      body: { id_usuario: idUsuario, id_permiso: idPermiso },
      headers: this.getHeaders()
    });
  }
}
