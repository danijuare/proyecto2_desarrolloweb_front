import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Vehiculo } from 'src/app/core/models/vehiculo.model';
import { Cliente } from 'src/app/core/models/cliente.model';
import { VehiculoService } from 'src/app/core/services/vehiculo.service';
import { ClienteService } from 'src/app/core/services/cliente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent implements OnInit {
  vehiculos: Vehiculo[] = [];
  vehiculosFiltrados: Vehiculo[] = [];
  clientes: Cliente[] = [];

  terminoBusqueda: string = '';
  cargando: boolean = false;

  vehiculoForm!: FormGroup;
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
    private vehiculoService: VehiculoService,
    private clienteService: ClienteService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarClientes();
    this.cargarVehiculos();
  }

  initForm(): void {
    this.vehiculoForm = this.fb.group({
      id_cliente: [null, [Validators.required]],
      placa: ['', [Validators.required, Validators.maxLength(15)]],
      marca: ['', [Validators.required, Validators.maxLength(50)]],
      modelo: ['', [Validators.required, Validators.maxLength(50)]],
      anio: [new Date().getFullYear(), [Validators.min(1900), Validators.max(2099)]],
      color: ['', [Validators.maxLength(30)]],
      vin: ['', [Validators.maxLength(50)]]
    });
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        // Cargar únicamente los clientes activos
        this.clientes = data.filter(c => c.condicion === '1' || c.condicion === undefined);
      },
      error: () => console.error('Error al obtener la lista de clientes.')
    });
  }

  cargarVehiculos(): void {
    this.cargando = true;
    this.vehiculoService.getVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.vehiculosFiltrados = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar los vehículos desde el servidor.',
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
      this.vehiculosFiltrados = [...this.vehiculos];
    } else {
      this.vehiculosFiltrados = this.vehiculos.filter(item => {
        const propietario = this.obtenerNombreCliente(item.id_cliente).toLowerCase();
        return (
          item.placa.toLowerCase().includes(termino) ||
          item.marca.toLowerCase().includes(termino) ||
          item.modelo.toLowerCase().includes(termino) ||
          (item.vin && item.vin.toLowerCase().includes(termino)) ||
          propietario.includes(termino)
        );
      });
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.vehiculoForm.reset({
      id_cliente: null,
      placa: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      color: '',
      vin: ''
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(vehiculo: Vehiculo): void {
    this.modoEdicion = true;
    this.idSeleccionado = vehiculo.id_vehiculo || null;
    this.vehiculoForm.patchValue({
      id_cliente: vehiculo.id_cliente,
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      color: vehiculo.color,
      vin: vehiculo.vin
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.vehiculoForm.invalid) {
      this.vehiculoForm.markAllAsTouched();
      this.Toast.fire({
        icon: 'warning',
        title: 'Completá los campos obligatorios (*)'
      });
      return;
    }

    const data: Vehiculo = this.vehiculoForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.vehiculoService.actualizarVehiculo(this.idSeleccionado, data).subscribe({
        next: () => {
          this.cargarVehiculos();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Vehículo actualizado correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar el vehículo.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.vehiculoService.crearVehiculo(data).subscribe({
        next: () => {
          this.cargarVehiculos();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Vehículo registrado con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo registrar el vehículo.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }

  obtenerNombreCliente(idCliente: number): string {
    const c = this.clientes.find(cli => cli.id_cliente === idCliente);
    if (!c) return `Cliente #${idCliente}`;
    return `${c.nombre} ${c.apellido}`;
  }
}