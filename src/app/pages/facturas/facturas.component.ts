import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { DetalleFactura, Factura, FacturaInput } from '../../core/models/factura.model';
import { OrdenTrabajo } from '../../core/models/orden-trabajo.model';
import { FacturaService } from '../../core/services/factura.service';
import { OrdenTrabajoService } from '../../core/services/orden-trabajo.service';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  facturas: Factura[] = [];
  ordenes: OrdenTrabajo[] = [];
  detalles: DetalleFactura[] = [];
  facturaSeleccionada: Factura | null = null;
  cargandoFacturas = false;
  guardandoFactura = false;
  guardandoDetalle = false;
  mostrarFacturaForm = false;
  mostrarDetalleForm = false;
  facturaForm: FormGroup;
  detalleForm: FormGroup;
  idFacturaEdicion: number | null = null;
  idDetalleEdicion: number | null = null;

  constructor(
    private facturaService: FacturaService,
    private ordenService: OrdenTrabajoService,
    private fb: FormBuilder
  ) {
    this.facturaForm = this.fb.group({
      id_orden: [null, Validators.required],
      subtotal_mano_obra: [0, [Validators.required, Validators.min(0)]],
      subtotal_repuestos: [0, [Validators.required, Validators.min(0)]],
      impuestos: [0, [Validators.required, Validators.min(0)]],
      estado_pago: ['pendiente', Validators.required]
    });
    this.detalleForm = this.fb.group({
      tipo: ['mano_obra', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_unitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarFacturas();
    this.ordenService.getOrdenes().subscribe({
      next: (ordenes) => this.ordenes = ordenes,
      error: (error) => this.mostrarError('No se pudieron cargar las órdenes de trabajo.', error)
    });
  }

  get ordenesDisponibles(): OrdenTrabajo[] {
    const idFacturaActual = this.idFacturaEdicion;
    const facturasOtras = this.facturas.filter(factura =>
      factura.id_factura !== idFacturaActual
    );
    return this.ordenes.filter(orden =>
      !facturasOtras.some(factura => factura.id_orden === orden.id_orden)
    );
  }

  cargarFacturas(idFacturaSeleccionada?: number): void {
    this.cargandoFacturas = true;
    this.facturaService.getFacturas().subscribe({
      next: (facturas) => {
        this.facturas = facturas;
        this.cargandoFacturas = false;
        const idDeseado = idFacturaSeleccionada ?? this.facturaSeleccionada?.id_factura;
        const factura = facturas.find(item => item.id_factura === idDeseado) || facturas[0] || null;
        if (factura) {
          this.seleccionarFactura(factura);
        } else {
          this.facturaSeleccionada = null;
          this.detalles = [];
        }
      },
      error: (error) => {
        this.cargandoFacturas = false;
        this.mostrarError('No se pudieron cargar las facturas.', error);
      }
    });
  }

  seleccionarFactura(factura: Factura): void {
    this.facturaSeleccionada = factura;
    this.detalles = [];
    this.facturaService.getDetalles(factura.id_factura).subscribe({
      next: (detalles) => this.detalles = detalles,
      error: (error) => this.mostrarError('No se pudieron cargar los detalles de la factura.', error)
    });
  }

  abrirCrearFactura(): void {
    this.idFacturaEdicion = null;
    this.facturaForm.reset({
      id_orden: null,
      subtotal_mano_obra: 0,
      subtotal_repuestos: 0,
      impuestos: 0,
      estado_pago: 'pendiente'
    });
    this.mostrarFacturaForm = true;
  }

  abrirEditarFactura(factura: Factura, event: Event): void {
    event.stopPropagation();
    this.idFacturaEdicion = factura.id_factura;
    this.facturaForm.reset({
      id_orden: factura.id_orden,
      subtotal_mano_obra: factura.subtotal_mano_obra,
      subtotal_repuestos: factura.subtotal_repuestos,
      impuestos: factura.impuestos,
      estado_pago: factura.estado_pago
    });
    this.mostrarFacturaForm = true;
  }

  cerrarFacturaForm(): void {
    this.mostrarFacturaForm = false;
  }

  guardarFactura(): void {
    if (this.facturaForm.invalid) {
      this.facturaForm.markAllAsTouched();
      return;
    }

    const datos: FacturaInput = {
      id_orden: Number(this.facturaForm.value.id_orden),
      subtotal_mano_obra: Number(this.facturaForm.value.subtotal_mano_obra),
      subtotal_repuestos: Number(this.facturaForm.value.subtotal_repuestos),
      impuestos: Number(this.facturaForm.value.impuestos),
      estado_pago: this.facturaForm.value.estado_pago
    };

    this.guardandoFactura = true;
    if (this.idFacturaEdicion === null) {
      this.facturaService.crearFactura(datos).subscribe({
        next: (factura) => {
          this.guardandoFactura = false;
          this.mostrarFacturaForm = false;
          this.cargarFacturas(factura.id_factura);
          Swal.fire({ icon: 'success', title: 'Factura creada', timer: 1800, showConfirmButton: false });
        },
        error: (error) => {
          this.guardandoFactura = false;
          this.mostrarError('No se pudo crear la factura.', error);
        }
      });
      return;
    }

    const id = this.idFacturaEdicion;
    this.facturaService.actualizarFactura(id, datos).subscribe({
      next: () => {
        this.guardandoFactura = false;
        this.mostrarFacturaForm = false;
        this.cargarFacturas(id);
        Swal.fire({ icon: 'success', title: 'Factura actualizada', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardandoFactura = false;
        this.mostrarError('No se pudo actualizar la factura.', error);
      }
    });
  }

  abrirCrearDetalle(): void {
    if (!this.facturaSeleccionada) {
      return;
    }
    this.idDetalleEdicion = null;
    this.detalleForm.reset({ tipo: 'mano_obra', descripcion: '', cantidad: 1, precio_unitario: 0 });
    this.mostrarDetalleForm = true;
  }

  abrirEditarDetalle(detalle: DetalleFactura): void {
    this.idDetalleEdicion = detalle.id_detalle;
    this.detalleForm.reset({
      tipo: detalle.tipo,
      descripcion: detalle.descripcion,
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario
    });
    this.mostrarDetalleForm = true;
  }

  cerrarDetalleForm(): void {
    this.mostrarDetalleForm = false;
  }

  guardarDetalle(): void {
    if (!this.facturaSeleccionada || this.detalleForm.invalid) {
      this.detalleForm.markAllAsTouched();
      return;
    }

    const datos = {
      id_factura: this.facturaSeleccionada.id_factura,
      tipo: this.detalleForm.value.tipo,
      descripcion: this.detalleForm.value.descripcion.trim(),
      cantidad: Number(this.detalleForm.value.cantidad),
      precio_unitario: Number(this.detalleForm.value.precio_unitario)
    };
    const guardado: Observable<unknown> = this.idDetalleEdicion === null
      ? this.facturaService.crearDetalle(datos)
      : this.facturaService.actualizarDetalle(this.idDetalleEdicion, datos);

    this.guardandoDetalle = true;
    guardado.subscribe({
      next: () => {
        this.guardandoDetalle = false;
        this.mostrarDetalleForm = false;
        this.refrescarFacturaSeleccionada();
        Swal.fire({ icon: 'success', title: 'Detalle guardado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardandoDetalle = false;
        this.mostrarError('No se pudo guardar el detalle.', error);
      }
    });
  }

  async eliminarDetalle(detalle: DetalleFactura): Promise<void> {
    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar detalle?',
      text: detalle.descripcion,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) {
      return;
    }
    this.facturaService.eliminarDetalle(detalle.id_detalle).subscribe({
      next: () => this.refrescarFacturaSeleccionada(),
      error: (error) => this.mostrarError('No se pudo eliminar el detalle.', error)
    });
  }

  async eliminarFactura(factura: Factura, event: Event): Promise<void> {
    event.stopPropagation();
    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar factura?',
      text: `Se eliminará la factura de la orden ${factura.id_orden} y sus detalles.`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) {
      return;
    }
    this.facturaService.eliminarFactura(factura.id_factura).subscribe({
      next: () => {
        this.facturaSeleccionada = null;
        this.detalles = [];
        this.cargarFacturas();
      },
      error: (error) => this.mostrarError('No se pudo eliminar la factura.', error)
    });
  }

  private refrescarFacturaSeleccionada(): void {
    if (this.facturaSeleccionada) {
      this.cargarFacturas(this.facturaSeleccionada.id_factura);
    }
  }

  private mostrarError(mensaje: string, error: { error?: { mensaje?: string } }): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.error?.mensaje || mensaje
    });
  }
}
