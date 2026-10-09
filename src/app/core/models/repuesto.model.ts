export interface Repuesto {
  id_repuesto?: number;
  id_categoria?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  stock_actual: number;
  stock_minimo: number;
  precio_unitario: number;
  nombreCategoria?: string; 
}