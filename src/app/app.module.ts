import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RolesComponent } from './pages/roles/roles.component';
import { PermisosComponent } from './pages/permisos/permisos.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { VehiculosComponent } from './pages/vehiculos/vehiculos.component';
import { MecanicosComponent } from './pages/mecanicos/mecanicos.component';
import { OrdenesTrabajoComponent } from './pages/ordenes-trabajo/ordenes-trabajo.component';
import { DiagnosticosComponent } from './pages/diagnosticos/diagnosticos.component';
import { ReparacionesComponent } from './pages/reparaciones/reparaciones.component';
import { DependenciasComponent } from './pages/dependencias/dependencias.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { RepuestosComponent } from './pages/repuestos/repuestos.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
