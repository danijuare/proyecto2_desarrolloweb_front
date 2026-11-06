import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCreateInput, UsuarioUpdateInput } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiBaseUrl}/Usuarios`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearUsuario(usuario: UsuarioCreateInput): Observable<{ mensaje: string; id_usuario: number }> {
    return this.http.post<{ mensaje: string; id_usuario: number }>(this.apiUrl, usuario, { headers: this.getHeaders() });
  }

  actualizarUsuario(id: number, usuario: UsuarioUpdateInput): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, usuario, { headers: this.getHeaders() });
  }

  desactivarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}