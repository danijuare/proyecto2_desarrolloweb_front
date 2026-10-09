import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Cliente } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];

  terminoBusqueda: string = '';
  cargando: boolean = false;

  clienteForm!: FormGroup;
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
    private clienteService: ClienteService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarClientes();
  }

  initForm(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      apellido: ['', [Validators.required, Validators.maxLength(80)]],
      telefono: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(120)]],
      direccion: ['', [Validators.maxLength(255)]],
      condicion: ['1']
    });
  }

  cargarClientes(): void {
    this.cargando = true;
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesFiltrados = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar los clientes desde el servidor.',
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
      this.clientesFiltrados = [...this.clientes];
    } else {
      this.clientesFiltrados = this.clientes.filter(c =>
        c.nombre.toLowerCase().includes(termino) ||
        c.apellido.toLowerCase().includes(termino) ||
        (c.email && c.email.toLowerCase().includes(termino)) ||
        (c.telefono && c.telefono.toLowerCase().includes(termino)) ||
        (c.id_cliente !== undefined && c.id_cliente.toString().includes(termino))
      );
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.clienteForm.reset({
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      condicion: '1'
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(cliente: Cliente): void {
    this.modoEdicion = true;
    this.idSeleccionado = cliente.id_cliente || null;
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      condicion: cliente.condicion || '1'
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.Toast.fire({
        icon: 'warning',
        title: 'Completá los campos requeridos (*)'
      });
      return;
    }

    const data: Cliente = this.clienteForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.clienteService.actualizarCliente(this.idSeleccionado, data).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Cliente actualizado correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar la información del cliente.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.clienteService.crearCliente(data).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Cliente registrado con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo registrar el cliente.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }
}