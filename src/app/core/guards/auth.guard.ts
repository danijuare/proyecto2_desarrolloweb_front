import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar roles requeridos en las rutas
    const rolesEsperados = route.data['roles'] as Array<string>;
    if (rolesEsperados) {
      const rolUsuario = localStorage.getItem('rol') || '';
      if (!rolesEsperados.includes(rolUsuario)) {
        alert('No tienes permisos para acceder a este módulo.');
        return false;
      }
    }

    return true;
  }
}