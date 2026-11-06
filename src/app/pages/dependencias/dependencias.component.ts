import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AccionReparacion } from '../../core/models/accion-reparacion.model';
import { DependenciaAccion } from '../../core/models/dependencia-accion.model';
import { AccionReparacionService } from '../../core/services/accion-reparacion.service';
import { DependenciaAccionService } from '../../core/services/dependencia-accion.service';

@Component({
  selector: 'app-dependencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dependencias.component.html',
  styleUrls: ['./dependencias.component.css']
})
export class DependenciasComponent implements OnInit {
  acciones: AccionReparacion[] = [];
  dependencias: DependenciaAccion[] = [];
  cargando = false;
  guardando = false;
  mostrarFormulario = false;
  dependenciaForm: FormGroup;

  constructor(
    private dependenciaService: DependenciaAccionService,
    private accionService: AccionReparacionService,
    private fb: FormBuilder
  ) {
    this.dependenciaForm = this.fb.group({
      id_accion: [null, Validators.required],
      id_accion_prerequisito: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  get accionesPrerequisito(): AccionReparacion[] {
    const idAccion = Number(this.dependenciaForm?.value.id_accion);
    return this.acciones.filter(accion => accion.id_accion !== idAccion);
  }

  cargarDatos(): void {
    this.cargando = true;
    let pendientes = 2;
    const completar = (): void => {
      pendientes -= 1;
      this.cargando = pendientes > 0;
    };

    this.accionService.getAcciones().subscribe({
      next: (acciones) => {
        this.acciones = acciones;
        completar();
      },
      error: (error) => {
        completar();
        this.mostrarError('No se pudieron cargar las acciones de reparación.', error);
      }
    });

    this.dependenciaService.getDependencias().subscribe({
      next: (dependencias) => {
        this.dependencias = dependencias;
        completar();
      },
      error: (error) => {
        completar();
        this.mostrarError('No se pudieron cargar las dependencias.', error);
      }
    });
  }

  abrirFormulario(): void {
    this.dependenciaForm.reset({ id_accion: null, id_accion_prerequisito: null });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  guardar(): void {
    if (this.dependenciaForm.invalid) {
      this.dependenciaForm.markAllAsTouched();
      return;
    }

    const datos = {
      id_accion: Number(this.dependenciaForm.value.id_accion),
      id_accion_prerequisito: Number(this.dependenciaForm.value.id_accion_prerequisito)
    };
    if (datos.id_accion === datos.id_accion_prerequisito) {
      Swal.fire({ icon: 'warning', title: 'Selecciona dos acciones diferentes.' });
      return;
    }

    this.guardando = true;
    this.dependenciaService.crearDependencia(datos).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.cargarDatos();
        Swal.fire({ icon: 'success', title: 'Dependencia registrada', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        this.mostrarError('No se pudo registrar la dependencia.', error);
      }
    });
  }

  async eliminar(dependencia: DependenciaAccion): Promise<void> {
    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar dependencia?',
      text: `${dependencia.descripcion_prerequisito} ya no será requisito de ${dependencia.descripcion_accion}.`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) {
      return;
    }

    this.dependenciaService.eliminarDependencia(dependencia.id_accion, dependencia.id_accion_prerequisito).subscribe({
      next: () => {
        this.cargarDatos();
        Swal.fire({ icon: 'success', title: 'Dependencia eliminada', timer: 1800, showConfirmButton: false });
      },
      error: (error) => this.mostrarError('No se pudo eliminar la dependencia.', error)
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
