export interface Transaccion {
  id: number;
  serie?: string;
  terminal?: string;
  mti?: string;
  processingCode?: string;
  apn?: string;
  aplicacion?: string;
  comercio?: string;
  mcc?: string;
  monto?: number;
  respuesta?: string;
  ip?: string;
  createdAt: string;
}

export interface SoportePmt {
  id: number;
  serie?: string;
  terminal?: string;
  tipo?: string;
  descripcion?: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelto';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
