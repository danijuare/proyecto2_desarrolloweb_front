import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { EstadoAccion } from 'src/app/core/models/estado-accion.model';
import { EstadoAccionService } from 'src/app/core/services/estado-accion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-estados-accion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './estados-accion.component.html',
  styleUrls: ['./estados-accion.component.css']
})
export class EstadosAccionComponent implements OnInit {
  estados: EstadoAccion[] = [];
  estadosFiltrados: EstadoAccion[] = [];

  terminoBusqueda: string = '';
  cargando: boolean = false;

  estadoForm!: FormGroup;
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
    private estadoService: EstadoAccionService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarEstados();
  }

  initForm(): void {
    this.estadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]]
    });
  }

  cargarEstados(): void {
    this.cargando = true;
    this.estadoService.getEstados().subscribe({
      next: (data) => {
        this.estados = data;
        this.estadosFiltrados = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar los estados de acción.',
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
      this.estadosFiltrados = [...this.estados];
    } else {
      this.estadosFiltrados = this.estados.filter(item =>
        item.nombre.toLowerCase().includes(termino) ||
        (item.id_estado !== undefined && item.id_estado.toString().includes(termino))
      );
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.estadoForm.reset({ nombre: '' });
    this.mostrarModal = true;
  }

  abrirModalEditar(item: EstadoAccion): void {
    this.modoEdicion = true;
    this.idSeleccionado = item.id_estado || null;
    this.estadoForm.patchValue({
      nombre: item.nombre
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.estadoForm.invalid) {
      this.estadoForm.markAllAsTouched();
      this.Toast.fire({
        icon: 'warning',
        title: 'Completá el campo obligatorio (*)'
      });
      return;
    }

    const data: EstadoAccion = this.estadoForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.estadoService.actualizarEstado(this.idSeleccionado, data).subscribe({
        next: () => {
          this.cargarEstados();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Estado actualizado correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar el estado.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.estadoService.crearEstado(data).subscribe({
        next: () => {
          this.cargarEstados();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Estado registrado con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo registrar el estado.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }
}