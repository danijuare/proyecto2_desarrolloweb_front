export interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre_rol: string;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface UsuarioCreateInput {
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface UsuarioUpdateInput {
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
}

export interface UsuarioPermiso {
  id_permiso: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo: 'conceder' | 'denegar';
}

export interface UsuarioPermisos {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  permisos_directos: UsuarioPermiso[];
}