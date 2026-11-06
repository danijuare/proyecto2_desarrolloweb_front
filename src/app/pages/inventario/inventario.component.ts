import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AccionReparacion } from '../../core/models/accion-reparacion.model';
import { MovimientoInventario, UsoRepuesto } from '../../core/models/movimiento-inventario.model';
import { Repuesto } from '../../core/models/repuesto.model';
import { AccionReparacionService } from '../../core/services/accion-reparacion.service';
import { AuthService } from '../../core/services/auth.service';
import { InventarioService } from '../../core/services/inventario.service';
import { RepuestoService } from '../../core/services/repuesto.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  repuestos: Repuesto[] = [];
  acciones: AccionReparacion[] = [];
  movimientos: MovimientoInventario[] = [];
  usos: UsoRepuesto[] = [];
  cargandoMovimientos = false;
  cargandoUsos = false;
  guardandoMovimiento = false;
  guardandoUso = false;
  movimientoForm: FormGroup;
  usoForm: FormGroup;

  constructor(
    private inventarioService: InventarioService,
    private repuestoService: RepuestoService,
    private accionService: AccionReparacionService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.movimientoForm = this.fb.group({
      id_repuesto: [null, Validators.required],
      tipo: ['entrada', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.maxLength(255)]
    });
    this.usoForm = this.fb.group({
      id_accion: [null, Validators.required],
      id_repuesto: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_unitario: [0, [Validators.required, Validators.min(0)]],
      justificacion: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.cargarRepuestos();
    this.cargarMovimientos();
    if (this.puedeRegistrarUso()) {
      this.accionService.getAcciones().subscribe({
        next: (acciones) => this.acciones = acciones,
        error: (error) => this.mostrarError('No se pudieron cargar las acciones de reparación.', error)
      });
      this.cargarUsos();
    }
  }

  esAdministrador(): boolean {
    return localStorage.getItem('rol') === 'Administrador';
  }

  puedeRegistrarMovimiento(): boolean {
    const rol = localStorage.getItem('rol');
    return rol === 'Administrador' || rol === 'Bodeguero';
  }

  puedeRegistrarUso(): boolean {
    const rol = localStorage.getItem('rol');
    return rol === 'Administrador' || rol === 'Mecanico';
  }

  cargarRepuestos(): void {
    this.repuestoService.getRepuestos().subscribe({
      next: (repuestos) => this.repuestos = repuestos,
      error: (error) => this.mostrarError('No se pudo cargar el inventario de repuestos.', error)
    });
  }

  cargarMovimientos(): void {
    this.cargandoMovimientos = true;
    this.inventarioService.getMovimientos().subscribe({
      next: (movimientos) => {
        this.movimientos = movimientos;
        this.cargandoMovimientos = false;
      },
      error: (error) => {
        this.cargandoMovimientos = false;
        this.mostrarError('No se pudo cargar el historial de movimientos.', error);
      }
    });
  }

  cargarUsos(): void {
    this.cargandoUsos = true;
    this.inventarioService.getUsos().subscribe({
      next: (usos) => {
        this.usos = usos;
        this.cargandoUsos = false;
      },
      error: (error) => {
        this.cargandoUsos = false;
        this.mostrarError('No se pudo cargar el historial de repuestos usados.', error);
      }
    });
  }

  registrarMovimiento(): void {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      return;
    }

    const idUsuario = this.authService.getUserId();
    if (idUsuario === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Vuelve a iniciar sesión',
        text: 'No se encontró el identificador de tu cuenta. Reinicia la sesión para registrar el movimiento.'
      });
      return;
    }

    this.guardandoMovimiento = true;
    this.inventarioService.crearMovimiento({
      id_repuesto: Number(this.movimientoForm.value.id_repuesto),
      id_usuario: idUsuario,
      tipo: this.movimientoForm.value.tipo,
      cantidad: Number(this.movimientoForm.value.cantidad),
      motivo: this.movimientoForm.value.motivo.trim() || null
    }).subscribe({
      next: () => {
        this.guardandoMovimiento = false;
        this.movimientoForm.reset({ id_repuesto: null, tipo: 'entrada', cantidad: 1, motivo: '' });
        this.cargarMovimientos();
        this.cargarRepuestos();
        Swal.fire({ icon: 'success', title: 'Movimiento registrado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardandoMovimiento = false;
        this.mostrarError('No se pudo registrar el movimiento.', error);
      }
    });
  }

  registrarUso(): void {
    if (this.usoForm.invalid) {
      this.usoForm.markAllAsTouched();
      return;
    }

    const idUsuario = this.authService.getUserId();
    if (idUsuario === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Vuelve a iniciar sesión',
        text: 'No se encontró el identificador de tu cuenta. Reinicia la sesión para registrar el consumo.'
      });
      return;
    }

    this.guardandoUso = true;
    this.inventarioService.crearUso({
      id_accion: Number(this.usoForm.value.id_accion),
      id_repuesto: Number(this.usoForm.value.id_repuesto),
      cantidad: Number(this.usoForm.value.cantidad),
      precio_unitario: Number(this.usoForm.value.precio_unitario) || null,
      justificacion: this.usoForm.value.justificacion.trim(),
      id_usuario_autoriza: idUsuario
    }).subscribe({
      next: () => {
        this.guardandoUso = false;
        this.usoForm.reset({ id_accion: null, id_repuesto: null, cantidad: 1, precio_unitario: 0, justificacion: '' });
        this.cargarUsos();
        this.cargarRepuestos();
        Swal.fire({ icon: 'success', title: 'Consumo registrado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardandoUso = false;
        this.mostrarError('No se pudo registrar el consumo.', error);
      }
    });
  }

  async eliminarUso(uso: UsoRepuesto): Promise<void> {
    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Revertir este consumo?',
      text: `Se devolverán ${uso.cantidad} unidad(es) de ${uso.nombre_repuesto || 'este repuesto'} al inventario.`,
      showCancelButton: true,
      confirmButtonText: 'Revertir',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) {
      return;
    }

    this.inventarioService.eliminarUso(uso.id_uso).subscribe({
      next: () => {
        this.cargarUsos();
        this.cargarRepuestos();
        Swal.fire({ icon: 'success', title: 'Consumo revertido', timer: 1800, showConfirmButton: false });
      },
      error: (error) => this.mostrarError('No se pudo revertir el consumo.', error)
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
