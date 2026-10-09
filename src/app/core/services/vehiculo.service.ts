import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../models/vehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiUrl = 'https://localhost:7073/api/Vehiculos';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getVehiculoById(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo, { headers: this.getHeaders() });
  }

  actualizarVehiculo(id: number, vehiculo: Vehiculo): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, vehiculo, { headers: this.getHeaders() });
  }
}