export interface Factura {
  id_factura: number;
  id_orden: number;
  subtotal_mano_obra: number;
  subtotal_repuestos: number;
  impuestos: number;
  total: number;
  estado_pago: 'pendiente' | 'pagada' | 'anulada';
  fecha_emision: string;
}

export interface FacturaInput {
  id_orden: number;
  subtotal_mano_obra: number;
  subtotal_repuestos: number;
  impuestos: number;
  estado_pago: 'pendiente' | 'pagada' | 'anulada';
}

export interface DetalleFactura {
  id_detalle: number;
  id_factura: number;
  tipo: 'mano_obra' | 'repuesto';
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface DetalleFacturaInput {
  id_factura: number;
  tipo: 'mano_obra' | 'repuesto';
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}
