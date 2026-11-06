import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permiso, RolePermisos } from '../models/permiso.model';
import { Role, RoleInput } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Roles`;
  private readonly permisosUrl = `${environment.apiBaseUrl}/RolesPermisos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearRole(role: RoleInput): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role, { headers: this.getHeaders() });
  }

  actualizarRole(id: number, role: RoleInput): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, role, { headers: this.getHeaders() });
  }

  eliminarRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getPermisos(idRole: number): Observable<RolePermisos> {
    return this.http.get<RolePermisos>(`${this.permisosUrl}/rol/${idRole}`, { headers: this.getHeaders() });
  }

  sincronizarPermisos(idRole: number, idsPermisos: number[]): Observable<void> {
    return this.http.post<void>(`${this.permisosUrl}/sincronizar`, {
      id_rol: idRole,
      ids_permisos: idsPermisos
    }, { headers: this.getHeaders() });
  }
}
