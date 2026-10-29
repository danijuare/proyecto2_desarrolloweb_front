export interface DiagnosticoSelect {
  id_diagnostico: number;
  descripcion?: string;
}

export interface EstadoAccion {
  id_estado: number;
  nombre: string;
}

export interface UsuarioSelect {
  id_usuario: number;
  nombre: string;
  apellido?: string;
  activo?: boolean;
}