import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Diagnostico, OrdenTrabajoSelect, MecanicoSelect } from 'src/app/core/models/diagnostico.model';
import { DiagnosticoService } from 'src/app/core/services/diagnostico.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-diagnosticos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './diagnosticos.component.html',
  styleUrls: ['./diagnosticos.component.css']
})
export class DiagnosticosComponent implements OnInit {
  diagnosticos: Diagnostico[] = [];
  diagnosticosFiltrados: Diagnostico[] = [];

  ordenes: OrdenTrabajoSelect[] = [];
  mecanicos: MecanicoSelect[] = [];

  gravedadesDisponibles = [
    { value: 'leve', label: 'Leve' },
    { value: 'moderada', label: 'Moderada' },
    { value: 'grave', label: 'Grave' },
    { value: 'critica', label: 'Crítica' }
  ];

  terminoBusqueda: string = '';
  cargando: boolean = false;

  diagnosticoForm!: FormGroup;
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
    private diagnosticoService: DiagnosticoService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogos();
    this.cargarDiagnosticos();
  }

  initForm(): void {
    this.diagnosticoForm = this.fb.group({
      id_orden: [null, [Validators.required]],
      id_mecanico: [null, [Validators.required]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      gravedad: ['leve', [Validators.required]]
    });
  }

  cargarCatalogos(): void {
    this.diagnosticoService.getOrdenesTrabajo().subscribe({
      next: (data) => this.ordenes = data,
      error: () => console.error('Error al cargar órdenes de trabajo.')
    });

    this.diagnosticoService.getMecanicos().subscribe({
      next: (data) => {
        // Filtramos solo mecánicos activos si la propiedad viene definida
        this.mecanicos = data.filter(m => m.activo === true || m.activo === undefined);
      },
      error: () => console.error('Error al cargar mecánicos.')
    });
  }

  cargarDiagnosticos(): void {
    this.cargando = true;
    this.diagnosticoService.getDiagnosticos().subscribe({
      next: (data) => {
        this.diagnosticos = data;
        this.diagnosticosFiltrados = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar los diagnósticos desde el servidor.',
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
      this.diagnosticosFiltrados = [...this.diagnosticos];
    } else {
      this.diagnosticosFiltrados = this.diagnosticos.filter(item =>
        item.descripcion.toLowerCase().includes(termino) ||
        (item.nombre_mecanico && item.nombre_mecanico.toLowerCase().includes(termino)) ||
        (item.gravedad && item.gravedad.toLowerCase().includes(termino)) ||
        item.id_orden.toString().includes(termino)
      );
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.diagnosticoForm.reset({
      id_orden: null,
      id_mecanico: null,
      descripcion: '',
      gravedad: 'leve'
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(item: Diagnostico): void {
    this.modoEdicion = true;
    this.idSeleccionado = item.id_diagnostico || null;
    this.diagnosticoForm.patchValue({
      id_orden: item.id_orden,
      id_mecanico: item.id_mecanico,
      descripcion: item.descripcion,
      gravedad: item.gravedad || 'leve'
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.diagnosticoForm.invalid) {
      this.diagnosticoForm.markAllAsTouched();
      this.Toast.fire({
        icon: 'warning',
        title: 'Completá los campos obligatorios (*)'
      });
      return;
    }

    const data: Diagnostico = this.diagnosticoForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.diagnosticoService.actualizarDiagnostico(this.idSeleccionado, data).subscribe({
        next: () => {
          this.cargarDiagnosticos();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Diagnóstico actualizado correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar el diagnóstico.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.diagnosticoService.crearDiagnostico(data).subscribe({
        next: () => {
          this.cargarDiagnosticos();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Diagnóstico registrado con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo registrar el diagnóstico.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }

  obtenerClaseGravedad(gravedad?: string): string {
    switch (gravedad?.toLowerCase()) {
      case 'leve': return 'badge-leve';
      case 'moderada': return 'badge-moderada';
      case 'grave': return 'badge-grave';
      case 'critica': return 'badge-critica';
      default: return '';
    }
  }
}