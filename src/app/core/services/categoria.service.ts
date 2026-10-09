import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'https://localhost:7073/api/CategoriasRepuesto';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getCategoriaById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria, { headers: this.getHeaders() });
  }

  actualizarCategoria(id: number, categoria: Categoria): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, categoria, { headers: this.getHeaders() });
  }
}