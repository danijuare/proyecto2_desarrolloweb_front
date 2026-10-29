import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { OrdenTrabajo, VehiculoSelect, MecanicoSelect, EstadoOrdenSelect } from 'src/app/core/models/orden-trabajo.model';
import { OrdenTrabajoService } from 'src/app/core/services/orden-trabajo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ordenes-trabajo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ordenes-trabajo.component.html',
  styleUrls: ['./ordenes-trabajo.component.css']
})
export class OrdenesTrabajoComponent implements OnInit {
  ordenes: OrdenTrabajo[] = [];
  ordenesFiltradas: OrdenTrabajo[] = [];

  vehiculos: VehiculoSelect[] = [];
  mecanicos: MecanicoSelect[] = [];
  estados: EstadoOrdenSelect[] = [];

  terminoBusqueda: string = '';
  cargando: boolean = false;

  ordenForm!: FormGroup;
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
    private ordenService: OrdenTrabajoService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogos();
    this.cargarOrdenes();
  }

  initForm(): void {
    this.ordenForm = this.fb.group({
      id_vehiculo: [null, [Validators.required]],
      id_mecanico: [null],
      id_estado: [null, [Validators.required]],
      kilometraje_ingreso: [null, [Validators.min(0)]],
      fecha_salida: [null],
      observaciones: ['', [Validators.maxLength(500)]]
    });
  }

  cargarCatalogos(): void {
    this.ordenService.getVehiculos().subscribe({
      next: (data) => this.vehiculos = data,
      error: () => console.error('Error al cargar vehículos.')
    });

    // CARGA DIRECTA DE MECÁNICOS
    this.ordenService.getMecanicos().subscribe({
      next: (data: any) => {
        console.log("data de los mecanicos ", data);
        this.mecanicos = data;
      },
      error: () => console.error('Error al cargar mecánicos.')
    });

    this.ordenService.getEstadosOrden().subscribe({
      next: (data) => this.estados = data,
      error: () => console.error('Error al cargar estados de orden.')
    });
  }

  cargarOrdenes(): void {
    this.cargando = true;
    this.ordenService.getOrdenes().subscribe({
      next: (data) => {
        this.ordenes = data;
        this.ordenesFiltradas = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar las órdenes de trabajo.',
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
      this.ordenesFiltradas = [...this.ordenes];
    } else {
      this.ordenesFiltradas = this.ordenes.filter(item =>
        (item.placa_vehiculo && item.placa_vehiculo.toLowerCase().includes(termino)) ||
        (item.vehiculo_info && item.vehiculo_info.toLowerCase().includes(termino)) ||
        (item.nombre_mecanico && item.nombre_mecanico.toLowerCase().includes(termino)) ||
        (item.nombre_estado && item.nombre_estado.toLowerCase().includes(termino)) ||
        (item.observaciones && item.observaciones.toLowerCase().includes(termino))
      );
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.ordenForm.reset({
      id_vehiculo: null,
      id_mecanico: null,
      id_estado: this.estados.length > 0 ? this.estados[0].id_estado : null,
      kilometraje_ingreso: null,
      fecha_salida: null,
      observaciones: ''
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(item: OrdenTrabajo): void {
    this.modoEdicion = true;
    this.idSeleccionado = item.id_orden || null;

    const fSalida = item.fecha_salida ? new Date(item.fecha_salida).toISOString().slice(0, 16) : null;

    this.ordenForm.patchValue({
      id_vehiculo: item.id_vehiculo,
      id_mecanico: item.id_mecanico,
      id_estado: item.id_estado,
      kilometraje_ingreso: item.kilometraje_ingreso,
      fecha_salida: fSalida,
      observaciones: item.observaciones
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      this.Toast.fire({
        icon: 'warning',
        title: 'Completá los campos obligatorios (*)'
      });
      return;
    }

    const data: OrdenTrabajo = this.ordenForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.ordenService.actualizarOrden(this.idSeleccionado, data).subscribe({
        next: () => {
          this.cargarOrdenes();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Orden actualizada correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar la orden de trabajo.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.ordenService.crearOrden(data).subscribe({
        next: () => {
          this.cargarOrdenes();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Orden registrada con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo registrar la orden de trabajo.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }
}