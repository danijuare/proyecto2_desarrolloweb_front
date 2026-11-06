import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/Auth`;

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Guardamos el token y los datos devueltos por el backend
        localStorage.setItem('token', response.token);
        localStorage.setItem('id_usuario', String(response.id_usuario));
        localStorage.setItem('usuario', response.usuario);
        localStorage.setItem('rol', response.rol);
        localStorage.setItem('permisos', JSON.stringify(response.permisos));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('id_usuario');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('permisos');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    const id = Number(localStorage.getItem('id_usuario'));
    return Number.isInteger(id) && id > 0 ? id : null;
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