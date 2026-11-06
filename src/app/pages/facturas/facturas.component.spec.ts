import { FormBuilder } from '@angular/forms';
import { Factura } from '../../core/models/factura.model';
import { OrdenTrabajo } from '../../core/models/orden-trabajo.model';
import { FacturaService } from '../../core/services/factura.service';
import { OrdenTrabajoService } from '../../core/services/orden-trabajo.service';
import { FacturasComponent } from './facturas.component';

describe('FacturasComponent', () => {
  let component: FacturasComponent;

  beforeEach(() => {
    const facturaService = jasmine.createSpyObj<FacturaService>('FacturaService', [
      'getFacturas',
      'getDetalles'
    ]);
    const ordenService = jasmine.createSpyObj<OrdenTrabajoService>('OrdenTrabajoService', ['getOrdenes']);
    component = new FacturasComponent(facturaService, ordenService, new FormBuilder());
    component.ordenes = [
      { id_orden: 1 } as OrdenTrabajo,
      { id_orden: 2 } as OrdenTrabajo
    ];
    component.facturas = [
      { id_factura: 10, id_orden: 1 } as Factura
    ];
  });

  it('excludes orders that already have a facture when creating one', () => {
    component.idFacturaEdicion = null;

    expect(component.ordenesDisponibles.map(orden => orden.id_orden)).toEqual([2]);
  });

  it('keeps the current order available when editing its facture', () => {
    component.idFacturaEdicion = 10;

    expect(component.ordenesDisponibles.map(orden => orden.id_orden)).toEqual([1, 2]);
  });
});
