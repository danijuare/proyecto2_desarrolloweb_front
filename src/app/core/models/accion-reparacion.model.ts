export interface AccionReparacion {
  id_accion?: number;
  id_diagnostico: number;
  descripcion: string;
  id_estado: number;
  nombre_estado?: string;
  id_usuario_autoriza?: number | null;
  usuario_autoriza?: string | null;
  fecha_autorizacion?: string | Date | null;
  orden_ejecucion: number;
  costo_mano_obra: number;
  fecha_creacion?: string | Date;
  fecha_finalizacion?: string | Date | null;
}