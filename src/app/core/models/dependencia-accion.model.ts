export interface DependenciaAccion {
  id_accion: number;
  descripcion_accion: string;
  id_accion_prerequisito: number;
  descripcion_prerequisito: string;
}

export interface DependenciaAccionInput {
  id_accion: number;
  id_accion_prerequisito: number;
}
