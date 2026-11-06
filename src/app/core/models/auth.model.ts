export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  id_usuario: number;
  usuario: string;
  rol: string;
  expiracion: string;
  permisos: string[];
}