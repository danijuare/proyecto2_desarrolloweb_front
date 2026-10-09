export interface Vehiculo {
  id_vehiculo?: number;
  id_cliente: number;
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  color?: string;
  vin?: string;
}