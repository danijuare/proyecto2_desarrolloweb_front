import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  usuarioActual: string = '';
  rolActual: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.usuarioActual = localStorage.getItem('usuario') || 'Usuario';
    this.rolActual = localStorage.getItem('rol') || 'Sin Rol';
  }

  esRol(rolRequerido: string): boolean {
    const rolGuardado = localStorage.getItem('rol');
    return rolGuardado === rolRequerido;
  }

  tienePermiso(rolRequerido: string): boolean {
    const rol = localStorage.getItem('rol');
    return rol === rolRequerido;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
