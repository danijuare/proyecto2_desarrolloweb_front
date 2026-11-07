import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import * as XLSX from 'xlsx-js-style';
import { ClienteService } from '../../core/services/cliente.service';
import { FacturaService } from '../../core/services/factura.service';
import { OrdenTrabajoService } from '../../core/services/orden-trabajo.service';
import { RepuestoService } from '../../core/services/repuesto.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { ReportesComponent } from './reportes.component';

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;

  beforeEach(async () => {
    const ordenTrabajoService = jasmine.createSpyObj('OrdenTrabajoService', ['getOrdenes']);
    const facturaService = jasmine.createSpyObj('FacturaService', ['getFacturas']);
    const repuestoService = jasmine.createSpyObj('RepuestoService', ['getRepuestos']);
    const clienteService = jasmine.createSpyObj('ClienteService', ['getClientes']);
    const vehiculoService = jasmine.createSpyObj('VehiculoService', ['getVehiculos']);

    ordenTrabajoService.getOrdenes.and.returnValue(of([
      { id_orden: 1, id_vehiculo: 3, id_estado: 1, fecha_salida: null, nombre_estado: 'En proceso' },
      { id_orden: 2, id_vehiculo: 4, id_estado: 2, fecha_salida: '2026-01-02', nombre_estado: 'Finalizada' }
    ]));
    facturaService.getFacturas.and.returnValue(of([
      {
        id_factura: 1, id_orden: 1, subtotal_mano_obra: 60, subtotal_repuestos: 30,
        impuestos: 10, total: 100, estado_pago: 'pagada', fecha_emision: '2026-01-01'
      },
      {
        id_factura: 2, id_orden: 2, subtotal_mano_obra: 10, subtotal_repuestos: 5,
        impuestos: 5, total: 20, estado_pago: 'pendiente', fecha_emision: '2026-01-02'
      },
      {
        id_factura: 3, id_orden: 2, subtotal_mano_obra: 10, subtotal_repuestos: 5,
        impuestos: 5, total: 20, estado_pago: 'anulada', fecha_emision: '2026-01-03'
      }
    ]));
    repuestoService.getRepuestos.and.returnValue(of([
      { codigo: 'ACE-1', nombre: 'Aceite', stock_actual: 2, stock_minimo: 3, precio_unitario: 15 },
      { codigo: 'FIL-1', nombre: 'Filtro', stock_actual: 8, stock_minimo: 2, precio_unitario: 30 }
    ]));
    clienteService.getClientes.and.returnValue(of([
      { id_cliente: 7, nombre: 'Ana', apellido: 'Pérez', condicion: 'Activo' }
    ]));
    vehiculoService.getVehiculos.and.returnValue(of([
      { id_vehiculo: 3, id_cliente: 7, placa: 'P123ABC', marca: 'Toyota', modelo: 'Yaris' }
    ]));

    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [
        { provide: OrdenTrabajoService, useValue: ordenTrabajoService },
        { provide: FacturaService, useValue: facturaService },
        { provide: RepuestoService, useValue: repuestoService },
        { provide: ClienteService, useValue: clienteService },
        { provide: VehiculoService, useValue: vehiculoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load the five report sources', () => {
    expect(component).toBeTruthy();
    expect(component.reportes.length).toBe(5);
    expect(component.cargando).toBeFalse();
    expect(component.ordenes.length).toBe(2);
    expect(component.facturas.length).toBe(3);
    expect(component.repuestos.length).toBe(2);
    expect(component.clientes.length).toBe(1);
    expect(component.vehiculos.length).toBe(1);
  });

  it('should calculate summary indicators and resolve vehicle owners', () => {
    expect(component.ordenesAbiertas).toBe(1);
    expect(component.facturasPendientes).toBe(1);
    expect(component.totalFacturado).toBe(120);
    expect(component.repuestosBajoMinimo).toBe(1);
    expect(component.valorInventario).toBe(270);
    expect(component.nombreCliente(7)).toBe('Ana Pérez');
  });

  it('should export a formatted Excel worksheet with one value per cell', () => {
    const writeFile = spyOn(XLSX, 'writeFile').and.stub();
    component.seleccionarReporte('vehiculos');
    component.exportarExcel();

    expect(writeFile).toHaveBeenCalled();
    const libro = writeFile.calls.mostRecent().args[0];
    const hoja = libro.Sheets['Vehículos'];
    expect(hoja['A1'].v).toBe('Placa');
    expect(hoja['A2'].v).toBe('P123ABC');
    expect(hoja['A1'].s.fill.fgColor.rgb).toBe('101D30');
    expect(hoja['!autofilter'].ref).toBe('A1:G2');

    const archivo = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const libroDescargable = XLSX.read(archivo, { type: 'array' });
    const hojaDescargable = libroDescargable.Sheets['Vehículos'];
    expect(hojaDescargable['A1'].v).toBe('Placa');
    expect(hojaDescargable['A2'].v).toBe('P123ABC');
  });

  it('should download the selected report as a PDF', fakeAsync(() => {
    const dispatch = spyOn(EventTarget.prototype, 'dispatchEvent').and.callThrough();
    component.descargarPdf();
    flush();
    expect(dispatch).toHaveBeenCalled();
  }));

  it('should filter the selected report and explain empty exports', () => {
    component.seleccionarReporte('repuestos');
    component.busqueda = 'ace';
    expect(component.repuestosFiltrados.length).toBe(1);
    expect(component.repuestosFiltrados[0].codigo).toBe('ACE-1');

    component.busqueda = 'no existe';
    component.exportarExcel();
    expect(component.mensajeExportacion).toContain('No hay registros');
  });
});
