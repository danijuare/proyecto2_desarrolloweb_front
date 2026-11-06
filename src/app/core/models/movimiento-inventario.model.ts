export interface MovimientoInventario {
  id_movimiento: number;
  id_repuesto: number;
  nombre_repuesto: string | null;
  codigo_repuesto: string | null;
  id_usuario: number;
  nombre_usuario: string | null;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  motivo: string | null;
  fecha: string;
}

export interface MovimientoInventarioInput {
  id_repuesto: number;
  id_usuario: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  motivo: string | null;
}

export interface UsoRepuesto {
  id_uso: number;
  id_accion: number;
  id_repuesto: number;
  nombre_repuesto: string | null;
  codigo_repuesto: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  justificacion: string;
  id_usuario_autoriza: number;
  nombre_usuario_autoriza: string | null;
  fecha: string;
}

export interface UsoRepuestoInput {
  id_accion: number;
  id_repuesto: number;
  cantidad: number;
  precio_unitario: number | null;
  justificacion: string;
  id_usuario_autoriza: number;
}
