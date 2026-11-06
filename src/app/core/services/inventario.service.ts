import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovimientoInventario, MovimientoInventarioInput, UsoRepuesto, UsoRepuestoInput } from '../models/movimiento-inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private readonly movimientosUrl = `${environment.apiBaseUrl}/MovimientosInventario`;
  private readonly usosUrl = `${environment.apiBaseUrl}/UsoRepuestos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getMovimientos(): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(this.movimientosUrl, { headers: this.getHeaders() });
  }

  crearMovimiento(movimiento: MovimientoInventarioInput): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(this.movimientosUrl, movimiento, { headers: this.getHeaders() });
  }

  getUsos(): Observable<UsoRepuesto[]> {
    return this.http.get<UsoRepuesto[]>(this.usosUrl, { headers: this.getHeaders() });
  }

  crearUso(uso: UsoRepuestoInput): Observable<UsoRepuesto> {
    return this.http.post<UsoRepuesto>(this.usosUrl, uso, { headers: this.getHeaders() });
  }

  eliminarUso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usosUrl}/${id}`, { headers: this.getHeaders() });
  }
}
