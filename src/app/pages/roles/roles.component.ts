import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Permiso } from '../../core/models/permiso.model';
import { Role } from '../../core/models/role.model';
import { PermisoService } from '../../core/services/permiso.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  permisos: Permiso[] = [];
  rolSeleccionado: Role | null = null;
  permisosSeleccionados: number[] = [];
  cargandoRoles = false;
  cargandoPermisos = false;
  guardandoPermisos = false;
  mostrarFormulario = false;
  rolForm: FormGroup;
  idEdicion: number | null = null;

  constructor(
    private roleService: RoleService,
    private permisoService: PermisoService,
    private fb: FormBuilder
  ) {
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarPermisos();
  }

  cargarRoles(): void {
    this.cargandoRoles = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.cargandoRoles = false;
        if (this.rolSeleccionado) {
          this.rolSeleccionado = roles.find(rol => rol.id_rol === this.rolSeleccionado?.id_rol) || null;
          if (!this.rolSeleccionado) {
            this.permisosSeleccionados = [];
          }
        }
      },
      error: (error) => {
        this.cargandoRoles = false;
        this.mostrarError('No se pudieron cargar los roles.', error);
      }
    });
  }

  cargarPermisos(): void {
    this.cargandoPermisos = true;
    this.permisoService.getPermisos().subscribe({
      next: (permisos) => {
        this.permisos = permisos.filter(permiso => permiso.condicion !== 0);
        this.cargandoPermisos = false;
      },
      error: (error) => {
        this.cargandoPermisos = false;
        this.mostrarError('No se pudieron cargar los permisos.', error);
      }
    });
  }

  seleccionarRol(rol: Role): void {
    this.rolSeleccionado = rol;
    this.permisosSeleccionados = [];
    this.roleService.getPermisos(rol.id_rol).subscribe({
      next: (respuesta) => {
        this.permisosSeleccionados = respuesta.permisos.map(permiso => permiso.id_permiso);
      },
      error: (error) => this.mostrarError('No se pudieron cargar los permisos del rol.', error)
    });
  }

  tienePermiso(idPermiso: number): boolean {
    return this.permisosSeleccionados.includes(idPermiso);
  }

  cambiarPermiso(idPermiso: number, event: Event): void {
    const seleccionado = (event.target as HTMLInputElement).checked;
    const permisos = new Set(this.permisosSeleccionados);
    if (seleccionado) {
      permisos.add(idPermiso);
    } else {
      permisos.delete(idPermiso);
    }
    this.permisosSeleccionados = Array.from(permisos);
  }

  guardarPermisos(): void {
    if (!this.rolSeleccionado) {
      return;
    }

    this.guardandoPermisos = true;
    this.roleService.sincronizarPermisos(this.rolSeleccionado.id_rol, this.permisosSeleccionados).subscribe({
      next: () => {
        this.guardandoPermisos = false;
        Swal.fire({ icon: 'success', title: 'Permisos actualizados', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardandoPermisos = false;
        this.mostrarError('No se pudieron guardar los permisos del rol.', error);
      }
    });
  }

  abrirCrear(): void {
    this.idEdicion = null;
    this.rolForm.reset({ nombre: '', descripcion: '' });
    this.mostrarFormulario = true;
  }

  abrirEditar(rol: Role, event: Event): void {
    event.stopPropagation();
    this.idEdicion = rol.id_rol;
    this.rolForm.reset({ nombre: rol.nombre, descripcion: rol.descripcion });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  guardarRol(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    const datos = {
      nombre: this.rolForm.value.nombre.trim(),
      descripcion: (this.rolForm.value.descripcion || '').trim()
    };
    const guardado: Observable<unknown> = this.idEdicion === null
      ? this.roleService.crearRole(datos)
      : this.roleService.actualizarRole(this.idEdicion, datos);

    guardado.subscribe({
      next: () => {
        this.mostrarFormulario = false;
        this.cargarRoles();
        Swal.fire({ icon: 'success', title: 'Rol guardado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => this.mostrarError('No se pudo guardar el rol.', error)
    });
  }

  async eliminarRol(rol: Role, event: Event): Promise<void> {
    event.stopPropagation();
    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar rol?',
      text: `Se eliminará el rol "${rol.nombre}".`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) {
      return;
    }

    this.roleService.eliminarRole(rol.id_rol).subscribe({
      next: () => {
        if (this.rolSeleccionado?.id_rol === rol.id_rol) {
          this.rolSeleccionado = null;
          this.permisosSeleccionados = [];
        }
        this.cargarRoles();
        Swal.fire({ icon: 'success', title: 'Rol eliminado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => this.mostrarError('No se pudo eliminar el rol.', error)
    });
  }

  private mostrarError(mensaje: string, error: { error?: { mensaje?: string } }): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.error?.mensaje || mensaje
    });
  }
}
