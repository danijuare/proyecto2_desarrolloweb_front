export interface OrdenTrabajo {
  id_orden?: number;
  id_vehiculo: number;
  placa_vehiculo?: string;
  vehiculo_info?: string;
  id_mecanico?: number | null;
  nombre_mecanico?: string | null;
  id_estado: number;
  nombre_estado?: string;
  kilometraje_ingreso?: number | null;
  fecha_ingreso?: string | Date;
  fecha_salida?: string | Date | null;
  observaciones?: string | null;
}

export interface VehiculoSelect {
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
}

export interface MecanicoSelect {
  id_mecanico?: number;
  nombre?: string;
  apellido?: string;
  activo?: boolean;
  nombre_completo?: string;
}

export interface EstadoOrdenSelect {
  id_estado: number;
  nombre: string;
}