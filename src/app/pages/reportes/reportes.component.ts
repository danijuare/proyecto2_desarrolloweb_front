import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { Cliente } from '../../core/models/cliente.model';
import { Factura } from '../../core/models/factura.model';
import { OrdenTrabajo } from '../../core/models/orden-trabajo.model';
import { Repuesto } from '../../core/models/repuesto.model';
import { Vehiculo } from '../../core/models/vehiculo.model';
import { ClienteService } from '../../core/services/cliente.service';
import { FacturaService } from '../../core/services/factura.service';
import { OrdenTrabajoService } from '../../core/services/orden-trabajo.service';
import { RepuestoService } from '../../core/services/repuesto.service';
import { VehiculoService } from '../../core/services/vehiculo.service';

type ReporteClave = 'ordenes' | 'facturas' | 'repuestos' | 'clientes' | 'vehiculos';

interface ErrorReporte {
  clave: ReporteClave;
  nombre: string;
  mensaje: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  readonly reportes: Array<{ clave: ReporteClave; nombre: string }> = [
    { clave: 'ordenes', nombre: 'Órdenes' },
    { clave: 'facturas', nombre: 'Facturas' },
    { clave: 'repuestos', nombre: 'Repuestos disponibles' },
    { clave: 'clientes', nombre: 'Clientes' },
    { clave: 'vehiculos', nombre: 'Vehículos' }
  ];

  reporteSeleccionado: ReporteClave = 'ordenes';
  busqueda = '';
  mensajeExportacion = '';
  ordenes: OrdenTrabajo[] = [];
  facturas: Factura[] = [];
  repuestos: Repuesto[] = [];
  clientes: Cliente[] = [];
  vehiculos: Vehiculo[] = [];
  errores: Partial<Record<ReporteClave, string>> = {};
  private cargasPendientes = 5;

  constructor(
    private ordenTrabajoService: OrdenTrabajoService,
    private facturaService: FacturaService,
    private repuestoService: RepuestoService,
    private clienteService: ClienteService,
    private vehiculoService: VehiculoService
  ) { }

  ngOnInit(): void {
    this.cargarReporte('ordenes', 'órdenes', this.ordenTrabajoService.getOrdenes(), datos => this.ordenes = datos);
    this.cargarReporte('facturas', 'facturas', this.facturaService.getFacturas(), datos => this.facturas = datos);
    this.cargarReporte('repuestos', 'repuestos', this.repuestoService.getRepuestos(), datos => this.repuestos = datos);
    this.cargarReporte('clientes', 'clientes', this.clienteService.getClientes(), datos => this.clientes = datos);
    this.cargarReporte('vehiculos', 'vehículos', this.vehiculoService.getVehiculos(), datos => this.vehiculos = datos);
  }

  get cargando(): boolean {
    return this.cargasPendientes > 0;
  }

  get erroresReporte(): ErrorReporte[] {
    return this.reportes
      .filter(reporte => Boolean(this.errores[reporte.clave]))
      .map(reporte => ({
        clave: reporte.clave,
        nombre: reporte.nombre,
        mensaje: this.errores[reporte.clave] || ''
      }));
  }

  get ordenesFiltradas(): OrdenTrabajo[] {
    return this.ordenes.filter(orden => this.coincideBusqueda([
      orden.id_orden, orden.placa_vehiculo, orden.vehiculo_info,
      orden.nombre_mecanico, orden.nombre_estado, orden.observaciones
    ]));
  }

  get facturasFiltradas(): Factura[] {
    return this.facturas.filter(factura => this.coincideBusqueda([
      factura.id_factura, factura.id_orden, factura.estado_pago, factura.fecha_emision
    ]));
  }

  get repuestosFiltrados(): Repuesto[] {
    return this.repuestos.filter(repuesto => this.coincideBusqueda([
      repuesto.codigo, repuesto.nombre, repuesto.nombreCategoria,
      repuesto.stock_actual, repuesto.stock_minimo
    ]));
  }

  get clientesFiltrados(): Cliente[] {
    return this.clientes.filter(cliente => this.coincideBusqueda([
      cliente.nombre, cliente.apellido, cliente.telefono, cliente.email,
      cliente.direccion, cliente.condicion
    ]));
  }

  get vehiculosFiltrados(): Vehiculo[] {
    return this.vehiculos.filter(vehiculo => this.coincideBusqueda([
      vehiculo.placa, vehiculo.marca, vehiculo.modelo, vehiculo.anio,
      vehiculo.color, vehiculo.vin, this.nombreCliente(vehiculo.id_cliente)
    ]));
  }

  get repuestosBajoMinimo(): number {
    return this.repuestos.filter(repuesto => repuesto.stock_actual <= repuesto.stock_minimo).length;
  }

  get valorInventario(): number {
    return this.repuestos.reduce(
      (total, repuesto) => total + repuesto.stock_actual * repuesto.precio_unitario,
      0
    );
  }

  get totalFacturado(): number {
    return this.facturas
      .filter(factura => factura.estado_pago !== 'anulada')
      .reduce((total, factura) => total + factura.total, 0);
  }

  get facturasPendientes(): number {
    return this.facturas.filter(factura => factura.estado_pago === 'pendiente').length;
  }

  get ordenesAbiertas(): number {
    return this.ordenes.filter(orden => !orden.fecha_salida).length;
  }

  nombreCliente(idCliente: number): string {
    const cliente = this.clientes.find(item => item.id_cliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : `Cliente #${idCliente}`;
  }

  seleccionarReporte(clave: ReporteClave): void {
    this.reporteSeleccionado = clave;
    this.busqueda = '';
  }

  exportarExcel(): void {
    const filas = this.filasReporteSeleccionado();
    if (!this.prepararExportacion(filas.length)) {
      return;
    }

    const encabezados = Object.keys(filas[0]);
    const hoja = XLSX.utils.aoa_to_sheet([
      encabezados,
      ...filas.map(fila => encabezados.map(encabezado => fila[encabezado]))
    ]);
    const rango = XLSX.utils.decode_range(hoja['!ref'] || 'A1');
    const referenciaHoja = hoja['!ref'] || 'A1';

    hoja['!cols'] = encabezados.map((encabezado, indice) => {
      const maximo = filas.reduce(
        (ancho, fila) => Math.max(ancho, String(fila[encabezado]).length),
        encabezado.length
      );
      return { wch: Math.min(Math.max(maximo + 3, 14), 42) };
    });
    hoja['!rows'] = [{ hpt: 28 }];
    hoja['!autofilter'] = { ref: referenciaHoja };

    for (let columna = rango.s.c; columna <= rango.e.c; columna += 1) {
      const encabezado = XLSX.utils.encode_cell({ r: 0, c: columna });
      hoja[encabezado].s = {
        fill: { fgColor: { rgb: '101D30' } },
        font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Aptos', sz: 11 },
        alignment: { vertical: 'center', horizontal: 'left' },
        border: { bottom: { style: 'medium', color: { rgb: 'B52C39' } } }
      };

      for (let fila = 1; fila <= rango.e.r; fila += 1) {
        const direccion = XLSX.utils.encode_cell({ r: fila, c: columna });
        const celda = hoja[direccion];
        if (!celda) {
          continue;
        }

        celda.s = {
          fill: { fgColor: { rgb: fila % 2 === 0 ? 'F1F4F8' : 'FFFFFF' } },
          font: { color: { rgb: '26364A' }, name: 'Aptos', sz: 10 },
          alignment: {
            vertical: 'center',
            horizontal: celda.t === 'n' ? 'right' : 'left'
          },
          border: {
            bottom: { style: 'hair', color: { rgb: 'DCE3EB' } },
            right: { style: 'hair', color: { rgb: 'E8EDF2' } }
          }
        };
        if (celda.t === 'n' && this.esColumnaMonetaria(encabezados[columna])) {
          celda.z = '"Q" #,##0.00';
        }
      }
    }

    const libro = XLSX.utils.book_new();
    const nombreReporte = this.nombreReporteSeleccionado();
    XLSX.utils.book_append_sheet(libro, hoja, nombreReporte.slice(0, 31));
    libro.Props = {
      Title: `Reporte de ${nombreReporte}`,
      Subject: 'Reporte generado desde el sistema de taller',
      Author: 'DJ Soluciones Automotrices',
      CreatedDate: new Date()
    };
    XLSX.writeFile(libro, `reporte-${this.reporteSeleccionado}-${this.fechaArchivo()}.xlsx`);
  }

  descargarPdf(): void {
    const filas = this.filasReporteSeleccionado();
    if (!this.prepararExportacion(filas.length)) {
      return;
    }

    const encabezados = Object.keys(filas[0]);
    const horizontal = encabezados.length > 5;
    const documento = new jsPDF({ orientation: horizontal ? 'landscape' : 'portrait', unit: 'mm' });
    const margen = 14;
    const nombreReporte = this.nombreReporteSeleccionado();

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(18);
    documento.setTextColor(22, 38, 58);
    documento.text(`Reporte de ${nombreReporte}`, margen, 18);

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(9);
    documento.setTextColor(105, 120, 139);
    documento.text(
      `${filas.length} registros · Generado el ${new Intl.DateTimeFormat('es-GT').format(new Date())}`,
      margen,
      25
    );

    autoTable(documento, {
      head: [encabezados],
      body: filas.map(fila => encabezados.map(encabezado =>
        this.formatearValorPdf(encabezado, fila[encabezado])
      )),
      startY: 31,
      margin: { top: 31, right: margen, bottom: 14, left: margen },
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: horizontal ? 7 : 8,
        cellPadding: 2.5,
        overflow: 'linebreak',
        textColor: [38, 54, 74],
        lineColor: [220, 227, 235],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [16, 29, 48],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [241, 244, 248] },
      didDrawPage: datos => {
        documento.setFontSize(8);
        documento.setTextColor(120, 132, 148);
        documento.text(
          `DJ Soluciones Automotrices · Página ${datos.pageNumber}`,
          documento.internal.pageSize.getWidth() - margen,
          documento.internal.pageSize.getHeight() - 6,
          { align: 'right' }
        );
      }
    });

    documento.save(`reporte-${this.reporteSeleccionado}-${this.fechaArchivo()}.pdf`);
    this.mensajeExportacion = '';
  }

  imprimir(): void {
    window.print();
  }

  private prepararExportacion(cantidadFilas: number): boolean {
    if (cantidadFilas === 0) {
      this.mensajeExportacion = 'No hay registros para exportar con los filtros actuales.';
      return false;
    }

    this.mensajeExportacion = '';
    return true;
  }

  private nombreReporteSeleccionado(): string {
    return this.reportes.find(reporte => reporte.clave === this.reporteSeleccionado)?.nombre || 'Reporte';
  }

  private esColumnaMonetaria(encabezado: string): boolean {
    return /mano de obra|repuestos|impuestos|total|precio|valor en inventario/i.test(encabezado);
  }

  private formatearValorPdf(encabezado: string, valor: string | number): string {
    return typeof valor === 'number' && this.esColumnaMonetaria(encabezado)
      ? new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(valor)
      : String(valor);
  }

  private cargarReporte<T>(
    clave: ReporteClave,
    nombre: string,
    solicitud: Observable<T[]>,
    asignar: (datos: T[]) => void
  ): void {
    solicitud.subscribe({
      next: datos => asignar(datos),
      error: error => {
        this.errores[clave] = `No se pudieron cargar ${nombre}. Intenta actualizar el reporte.`;
        console.error(`Error al cargar el reporte de ${nombre}.`, error);
        this.finalizarCarga();
      },
      complete: () => this.finalizarCarga()
    });
  }

  private finalizarCarga(): void {
    this.cargasPendientes = Math.max(0, this.cargasPendientes - 1);
  }

  private coincideBusqueda(valores: unknown[]): boolean {
    const termino = this.busqueda.trim().toLocaleLowerCase();
    return !termino || valores.some(valor =>
      String(valor ?? '').toLocaleLowerCase().includes(termino)
    );
  }

  private filasReporteSeleccionado(): Array<Record<string, string | number>> {
    switch (this.reporteSeleccionado) {
      case 'ordenes':
        return this.ordenesFiltradas.map(orden => ({
          'N.º orden': orden.id_orden ?? '',
          'Vehículo': orden.vehiculo_info || orden.placa_vehiculo || '',
          'Mecánico': orden.nombre_mecanico || '',
          'Estado': orden.nombre_estado || '',
          'Fecha ingreso': this.formatearFecha(orden.fecha_ingreso),
          'Fecha salida': this.formatearFecha(orden.fecha_salida),
          'Kilometraje': orden.kilometraje_ingreso ?? '',
          'Observaciones': orden.observaciones || ''
        }));
      case 'facturas':
        return this.facturasFiltradas.map(factura => ({
          'N.º factura': factura.id_factura,
          'N.º orden': factura.id_orden,
          'Fecha emisión': this.formatearFecha(factura.fecha_emision),
          'Estado de pago': factura.estado_pago,
          'Mano de obra': factura.subtotal_mano_obra,
          'Repuestos': factura.subtotal_repuestos,
          'Impuestos': factura.impuestos,
          'Total': factura.total
        }));
      case 'repuestos':
        return this.repuestosFiltrados.map(repuesto => ({
          Código: repuesto.codigo,
          Nombre: repuesto.nombre,
          Categoría: repuesto.nombreCategoria || '',
          'Stock actual': repuesto.stock_actual,
          'Stock mínimo': repuesto.stock_minimo,
          'Precio unitario': repuesto.precio_unitario,
          'Valor en inventario': repuesto.stock_actual * repuesto.precio_unitario
        }));
      case 'clientes':
        return this.clientesFiltrados.map(cliente => ({
          Nombre: cliente.nombre,
          Apellido: cliente.apellido,
          Teléfono: cliente.telefono || '',
          Correo: cliente.email || '',
          Dirección: cliente.direccion || '',
          Estado: cliente.condicion || ''
        }));
      case 'vehiculos':
        return this.vehiculosFiltrados.map(vehiculo => ({
          Placa: vehiculo.placa,
          Marca: vehiculo.marca,
          Modelo: vehiculo.modelo,
          Año: vehiculo.anio ?? '',
          Color: vehiculo.color || '',
          VIN: vehiculo.vin || '',
          Cliente: this.nombreCliente(vehiculo.id_cliente)
        }));
    }
  }

  private formatearFecha(valor: string | Date | null | undefined): string {
    if (!valor) {
      return '';
    }

    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime())
      ? String(valor)
      : new Intl.DateTimeFormat('es-GT').format(fecha);
  }

  private fechaArchivo(): string {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
  }
}
