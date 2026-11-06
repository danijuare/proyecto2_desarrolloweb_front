import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DetalleFactura, DetalleFacturaInput, Factura, FacturaInput } from '../models/factura.model';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private readonly facturasUrl = `${environment.apiBaseUrl}/Facturas`;
  private readonly detallesUrl = `${environment.apiBaseUrl}/DetalleFactura`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.facturasUrl, { headers: this.getHeaders() });
  }

  crearFactura(factura: FacturaInput): Observable<Factura> {
    return this.http.post<Factura>(this.facturasUrl, factura, { headers: this.getHeaders() });
  }

  actualizarFactura(id: number, factura: FacturaInput): Observable<void> {
    return this.http.put<void>(`${this.facturasUrl}/${id}`, factura, { headers: this.getHeaders() });
  }

  eliminarFactura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.facturasUrl}/${id}`, { headers: this.getHeaders() });
  }

  getDetalles(idFactura: number): Observable<DetalleFactura[]> {
    return this.http.get<DetalleFactura[]>(`${this.detallesUrl}/factura/${idFactura}`, { headers: this.getHeaders() });
  }

  crearDetalle(detalle: DetalleFacturaInput): Observable<DetalleFactura> {
    return this.http.post<DetalleFactura>(this.detallesUrl, detalle, { headers: this.getHeaders() });
  }

  actualizarDetalle(id: number, detalle: DetalleFacturaInput): Observable<void> {
    return this.http.put<void>(`${this.detallesUrl}/${id}`, detalle, { headers: this.getHeaders() });
  }

  eliminarDetalle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.detallesUrl}/${id}`, { headers: this.getHeaders() });
  }
}
