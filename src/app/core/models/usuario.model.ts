export interface Usuario {
  id_usuario?: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  password_hash?: string;
  activo: boolean;
  fecha_creacion?: string;
  nombreRol?: string;
}