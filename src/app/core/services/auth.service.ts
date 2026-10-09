import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7073/api/Auth';

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Guardamos el token y los datos devueltos por el backend
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', response.usuario);
        localStorage.setItem('rol', response.rol);
        localStorage.setItem('permisos', JSON.stringify(response.permisos));
      })
    );
  }

  logout(): void {
    localStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerPermisos(): string[] {
    const permisosStr = localStorage.getItem('permisos');
    return permisosStr ? JSON.parse(permisosStr) : [];
  }

  tienePermiso(permisoRequerido: string): boolean {
    const permisos = this.obtenerPermisos();
    return permisos.includes(permisoRequerido);
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }
}