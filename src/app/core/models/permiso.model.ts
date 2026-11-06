export interface Permiso {
  id_permiso: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  condicion: number;
}

export interface PermisoInput {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  condicion: number;
}

export interface RolePermisos {
  id_rol: number;
  nombre_rol: string;
  permisos: Permiso[];
}
