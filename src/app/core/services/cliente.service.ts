import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'https://localhost:7073/api/Clientes';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente, { headers: this.getHeaders() });
  }

  actualizarCliente(id: number, cliente: Cliente): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, cliente, { headers: this.getHeaders() });
  }

  cambiarEstadoCliente(id: number, condicion: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { condicion }, { headers: this.getHeaders() });
  }
}