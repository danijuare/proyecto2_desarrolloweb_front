export interface Diagnostico {
  id_diagnostico?: number;
  id_orden: number;
  id_mecanico: number;
  nombre_mecanico?: string;
  descripcion: string;
  gravedad?: 'leve' | 'moderada' | 'grave' | 'critica' | string;
  fecha_diagnostico?: string | Date;
}

export interface OrdenTrabajoSelect {
  id_orden: number;
  // Agregá propiedades adicionales si querés mostrar detalles de la orden en el select
}

export interface MecanicoSelect {
  id_mecanico: number;
  nombre?: string; // Dependiendo de cómo lo devuelva tu API de mecánicos
  apellido?: string;
  activo?: boolean;
}