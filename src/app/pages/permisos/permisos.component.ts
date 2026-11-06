import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Permiso } from '../../core/models/permiso.model';
import { PermisoService } from '../../core/services/permiso.service';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit {
  permisos: Permiso[] = [];
  cargando = false;
  guardando = false;
  mostrarInactivos = false;
  mostrarFormulario = false;
  permisoForm: FormGroup;
  idEdicion: number | null = null;

  constructor(private permisoService: PermisoService, private fb: FormBuilder) {
    this.permisoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(60)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      condicion: [1, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarPermisos();
  }

  get permisosVisibles(): Permiso[] {
    return this.mostrarInactivos
      ? this.permisos
      : this.permisos.filter(permiso => permiso.condicion !== 0);
  }

  cambiarVisibilidad(event: Event): void {
    this.mostrarInactivos = (event.target as HTMLInputElement).checked;
  }

  cargarPermisos(): void {
    this.cargando = true;
    this.permisoService.getPermisos().subscribe({
      next: (permisos) => {
        this.permisos = permisos;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.mostrarError('No se pudieron cargar los permisos.', error);
      }
    });
  }

  abrirCrear(): void {
    this.idEdicion = null;
    this.permisoForm.reset({ codigo: '', nombre: '', descripcion: '', condicion: 1 });
    this.mostrarFormulario = true;
  }

  abrirEditar(permiso: Permiso): void {
    this.idEdicion = permiso.id_permiso;
    this.permisoForm.reset({
      codigo: permiso.codigo,
      nombre: permiso.nombre,
      descripcion: permiso.descripcion || '',
      condicion: permiso.condicion
    });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  guardarPermiso(): void {
    if (this.permisoForm.invalid) {
      this.permisoForm.markAllAsTouched();
      return;
    }

    const datos = {
      codigo: this.permisoForm.value.codigo.trim(),
      nombre: this.permisoForm.value.nombre.trim(),
      descripcion: (this.permisoForm.value.descripcion || '').trim() || null,
      condicion: Number(this.permisoForm.value.condicion)
    };
    const guardado: Observable<unknown> = this.idEdicion === null
      ? this.permisoService.crearPermiso(datos)
      : this.permisoService.actualizarPermiso(this.idEdicion, datos);

    this.guardando = true;
    guardado.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.cargarPermisos();
        Swal.fire({ icon: 'success', title: 'Permiso guardado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        this.mostrarError('No se pudo guardar el permiso.', error);
      }
    });
  }

  async desactivarPermiso(permiso: Permiso): Promise<void> {
    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar permiso?',
      text: `El permiso "${permiso.nombre}" dejará de estar disponible para asignarse.`,
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) {
      return;
    }

    this.permisoService.desactivarPermiso(permiso.id_permiso).subscribe({
      next: () => {
        this.cargarPermisos();
        Swal.fire({ icon: 'success', title: 'Permiso desactivado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => this.mostrarError('No se pudo desactivar el permiso.', error)
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
