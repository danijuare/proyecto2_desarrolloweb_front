import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrdenTrabajo, VehiculoSelect, EstadoOrdenSelect } from '../models/orden-trabajo.model';
import { Mecanico } from '../models/mecanico.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenTrabajoService {
  private apiUrl = 'https://localhost:7073/api/OrdenesTrabajo';
  private apiVehiculos = 'https://localhost:7073/api/Vehiculos';
  private apiMecanicos = 'https://localhost:7073/api/Mecanicos';
  private apiEstadosOrden = 'https://localhost:7073/api/EstadosOrden';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getOrdenes(): Observable<OrdenTrabajo[]> {
    return this.http.get<OrdenTrabajo[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearOrden(orden: OrdenTrabajo): Observable<OrdenTrabajo> {
    return this.http.post<OrdenTrabajo>(this.apiUrl, orden, { headers: this.getHeaders() });
  }

  actualizarOrden(id: number, orden: OrdenTrabajo): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, orden, { headers: this.getHeaders() });
  }

  getVehiculos(): Observable<VehiculoSelect[]> {
    return this.http.get<VehiculoSelect[]>(this.apiVehiculos, { headers: this.getHeaders() });
  }

  // USAR EL MODELO REAL DE MECÁNICO SIN FILTROS RESTRICTIVOS QUE VACÍEN LA LISTA
  getMecanicos(): Observable<Mecanico[]> {
    return this.http.get<Mecanico[]>(this.apiMecanicos, { headers: this.getHeaders() });
  }

  getEstadosOrden(): Observable<EstadoOrdenSelect[]> {
    return this.http.get<EstadoOrdenSelect[]>(this.apiEstadosOrden, { headers: this.getHeaders() });
  }
}