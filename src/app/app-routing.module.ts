import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

//modulos
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { DependenciasComponent } from './pages/dependencias/dependencias.component';
import { DiagnosticosComponent } from './pages/diagnosticos/diagnosticos.component';
import { MecanicosComponent } from './pages/mecanicos/mecanicos.component';
import { OrdenesTrabajoComponent } from './pages/ordenes-trabajo/ordenes-trabajo.component';
import { PermisosComponent } from './pages/permisos/permisos.component';
import { ReparacionesComponent } from './pages/reparaciones/reparaciones.component';
import { RepuestosComponent } from './pages/repuestos/repuestos.component';
import { RolesComponent } from './pages/roles/roles.component';
import { VehiculosComponent } from './pages/vehiculos/vehiculos.component';

//guard de seguridad
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      // Módulos del taller
      { 
        path: 'ordenes-trabajo', 
        component: OrdenesTrabajoComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico'] }
      },
      { 
        path: 'diagnosticos', 
        component: DiagnosticosComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico'] }
      },
      { 
        path: 'reparaciones', 
        component: ReparacionesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico'] }
      },
      { 
        path: 'vehiculos', 
        component: VehiculosComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico', 'Recepcionista'] }
      },
      { 
        path: 'clientes', 
        component: ClientesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Recepcionista'] }
      },

      // Inventario y Catálogos
      { 
        path: 'repuestos', 
        component: RepuestosComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Mecanico'] }
      },
      { 
        path: 'categorias', 
        component: CategoriasComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },

      // Administración del Sistema
      { 
        path: 'mecanicos', 
        component: MecanicosComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'dependencias', 
        component: DependenciasComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'roles', 
        component: RolesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'permisos', 
        component: PermisosComponent,
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