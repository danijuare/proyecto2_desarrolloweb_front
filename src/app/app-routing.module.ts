import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(module => module.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(module => module.DashboardComponent),
    canActivate: [AuthGuard],
    children: [
      // Módulos del taller
      { 
        path: 'ordenes-trabajo', 
        loadComponent: () => import('./pages/ordenes-trabajo/ordenes-trabajo.component').then(module => module.OrdenesTrabajoComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico', 'Recepcionista'] }
      },
      { 
        path: 'diagnosticos', 
        loadComponent: () => import('./pages/diagnosticos/diagnosticos.component').then(module => module.DiagnosticosComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico'] }
      },
      { 
        path: 'reparaciones', 
        loadComponent: () => import('./pages/reparaciones/reparaciones.component').then(module => module.ReparacionesComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico'] }
      },
      { 
        path: 'vehiculos', 
        loadComponent: () => import('./pages/vehiculos/vehiculos.component').then(module => module.VehiculosComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico', 'Recepcionista'] }
      },
      { 
        path: 'clientes', 
        loadComponent: () => import('./pages/clientes/clientes.component').then(module => module.ClientesComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Recepcionista'] }
      },

      // Inventario y Catálogos
      { 
        path: 'repuestos', 
        loadComponent: () => import('./pages/repuestos/repuestos.component').then(module => module.RepuestosComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico', 'Bodeguero'] }
      },
      {
        path: 'inventario',
        loadComponent: () => import('./pages/inventario/inventario.component').then(module => module.InventarioComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico', 'Bodeguero'] }
      },
      {
        path: 'facturas',
        loadComponent: () => import('./pages/facturas/facturas.component').then(module => module.FacturasComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Recepcionista'] }
      },
      { 
        path: 'categorias', 
        loadComponent: () => import('./pages/categorias/categorias.component').then(module => module.CategoriasComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },

      // Administración del Sistema
      { 
        path: 'mecanicos', 
        loadComponent: () => import('./pages/mecanicos/mecanicos.component').then(module => module.MecanicosComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'dependencias', 
        loadComponent: () => import('./pages/dependencias/dependencias.component').then(module => module.DependenciasComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'roles', 
        loadComponent: () => import('./pages/roles/roles.component').then(module => module.RolesComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.component').then(module => module.UsuariosComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'permisos', 
        loadComponent: () => import('./pages/permisos/permisos.component').then(module => module.PermisosComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'estados-accion',
        loadComponent: () => import('./pages/estados-accion/estados-accion.component').then(module => module.EstadosAccionComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }