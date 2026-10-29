import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AccionReparacion } from 'src/app/core/models/accion-reparacion.model';
import { DiagnosticoSelect, EstadoAccion, UsuarioSelect } from 'src/app/core/models/catalogos.model';
import { AccionReparacionService } from 'src/app/core/services/accion-reparacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reparaciones.component.html',
  styleUrls: ['./reparaciones.component.css']
})
export class ReparacionesComponent implements OnInit {
  acciones: AccionReparacion[] = [];
  accionesFiltradas: AccionReparacion[] = [];

  diagnosticos: DiagnosticoSelect[] = [];
  estados: EstadoAccion[] = [];
  usuarios: UsuarioSelect[] = [];

  terminoBusqueda: string = '';
  cargando: boolean = false;

  accionForm!: FormGroup;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  idSeleccionado: number | null = null;

  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1e293b',
    color: '#f8fafc',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  constructor(
    private accionService: AccionReparacionService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogos();
    this.cargarAcciones();
  }

  initForm(): void {
    this.accionForm = this.fb.group({
      id_diagnostico: [null, [Validators.required]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      id_estado: [null, [Validators.required]],
      id_usuario_autoriza: [null],
      fecha_autorizacion: [null],
      orden_ejecucion: [1, [Validators.required, Validators.min(1)]],
      costo_mano_obra: [0.00, [Validators.required, Validators.min(0)]],
      fecha_finalizacion: [null]
    });
  }

  cargarCatalogos(): void {
    this.accionService.getDiagnosticos().subscribe({
      next: (data) => this.diagnosticos = data,
      error: () => console.error('Error al cargar diagnósticos')
    });

    this.accionService.getEstadosAccion().subscribe({
      next: (data) => this.estados = data,
      error: () => console.error('Error al cargar estados de acción')
    });

    this.accionService.getUsuarios().subscribe({
      next: (data) => this.usuarios = data.filter(u => u.activo !== false),
      error: () => console.error('Error al cargar usuarios')
    });
  }

  cargarAcciones(): void {
    this.cargando = true;
    this.accionService.getAcciones().subscribe({
      next: (data) => {
        this.acciones = data;
        this.accionesFiltradas = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar las acciones de reparación.',
          background: '#1e293b',
          color: '#f8fafc',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  filtrar(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.accionesFiltradas = [...this.acciones];
    } else {
      this.accionesFiltradas = this.acciones.filter(item =>
        item.descripcion.toLowerCase().includes(termino) ||
        (item.nombre_estado && item.nombre_estado.toLowerCase().includes(termino)) ||
        (item.usuario_autoriza && item.usuario_autoriza.toLowerCase().includes(termino)) ||
        item.id_diagnostico.toString().includes(termino)
      );
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.accionForm.reset({
      id_diagnostico: null,
      descripcion: '',
      id_estado: this.estados.length > 0 ? this.estados[0].id_estado : null,
      id_usuario_autoriza: null,
      fecha_autorizacion: null,
      orden_ejecucion: 1,
      costo_mano_obra: 0.00,
      fecha_finalizacion: null
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(item: AccionReparacion): void {
    this.modoEdicion = true;
    this.idSeleccionado = item.id_accion || null;
    
    // Formatear fechas para input datetime-local si existen
    const fAuth = item.fecha_autorizacion ? new Date(item.fecha_autorizacion).toISOString().slice(0, 16) : null;
    const fFin = item.fecha_finalizacion ? new Date(item.fecha_finalizacion).toISOString().slice(0, 16) : null;

    this.accionForm.patchValue({
      id_diagnostico: item.id_diagnostico,
      descripcion: item.descripcion,
      id_estado: item.id_estado,
      id_usuario_autoriza: item.id_usuario_autoriza,
      fecha_autorizacion: fAuth,
      orden_ejecucion: item.orden_ejecucion,
      costo_mano_obra: item.costo_mano_obra,
      fecha_finalizacion: fFin
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.accionForm.invalid) {
      this.accionForm.markAllAsTouched();
      this.Toast.fire({
        icon: 'warning',
        title: 'Completá los campos obligatorios (*)'
      });
      return;
    }

    const data: AccionReparacion = this.accionForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.accionService.actualizarAccion(this.idSeleccionado, data).subscribe({
        next: () => {
          this.cargarAcciones();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Acción actualizada correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar la acción.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.accionService.crearAccion(data).subscribe({
        next: () => {
          this.cargarAcciones();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Acción registrada con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo registrar la acción.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }
}