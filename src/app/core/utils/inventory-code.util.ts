import { AccessoryCategory } from '../models/pos-admin';

/** Prefijos de código de inventario por tipo de ítem. */
export const INVENTORY_PREFIX = {
  pos: 'POS',
  sim: 'SIM',
  accessory: 'ACC',
  consumableFallback: 'CON',
} as const;

/** Prefijos de consumibles según tipo (rollo, cargador, base, batería, funda…). */
export function consumablePrefixFromType(type: string): string {
  const t = type.toLowerCase();
  if (/rollo|rodillo|papel/.test(t)) return 'ROL';
  if (/cargador/.test(t)) return 'CAR';
  if (/base|cradle/.test(t)) return 'BAS';
  if (/bater/.test(t)) return 'BAT';
  if (/funda/.test(t)) return 'FUN';
  return INVENTORY_PREFIX.consumableFallback;
}

export function accessoryInventoryPrefix(category: AccessoryCategory, type: string): string {
  return category === 'accessory' ? INVENTORY_PREFIX.accessory : consumablePrefixFromType(type);
}

export function formatInventoryCode(prefix: string, seq: number, pad = 3): string {
  return `${prefix}-${String(seq).padStart(pad, '0')}`;
}

/** Extrae el número secuencial de un código tipo `POS-012`. */
export function parseInventorySeq(code: string | undefined | null): number {
  if (!code) return 0;
  const m = code.match(/-(\d+)\s*$/);
  return m ? Number(m[1]) : 0;
}

export function nextInventoryCode(existing: (string | undefined)[], prefix: string, pad = 3): string {
  let max = 0;
  for (const code of existing) {
    if (!code) continue;
    const upper = code.toUpperCase();
    if (!upper.startsWith(`${prefix.toUpperCase()}-`)) continue;
    max = Math.max(max, parseInventorySeq(code));
  }
  return formatInventoryCode(prefix, max + 1, pad);
}
