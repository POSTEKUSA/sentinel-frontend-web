/** Motivos predefinidos para envío a reparación / garantía. Última opción siempre "Otro". */

export const MOTIVOS_REPARACION: string[] = [
  'Pantalla dañada o sin respuesta',
  'No enciende',
  'Falla de comunicación / red',
  'Lector de chip o tarjeta falla',
  'Impresora no funciona',
  'Pinpad bloqueado o sin respuesta',
  'Daño físico (golpe o caída)',
  'Fallo de batería o alimentación',
  'Error de software / reinicios constantes',
  'Otro',
];

export const MOTIVOS_GARANTIA: string[] = [
  'Defecto de fábrica',
  'Falla al instalar equipo nuevo',
  'Falla recurrente después de reparación',
  'Hardware no cumple especificaciones',
  'Alerta de tampers / sello de seguridad',
  'Fallo cubierto por garantía del fabricante',
  'Equipo no procesa transacciones desde origen',
  'Otro',
];

export function buildMotivoComment(motivo: string, detalle?: string): string {
  const d = (detalle ?? '').trim();
  if (!motivo) return d;
  if (motivo === 'Otro') return d || 'Otro';
  return d ? `${motivo} — ${d}` : motivo;
}
