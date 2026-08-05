/** Paleta categórica compartida — misma que usan las variantes de color de `.kpi-card--*` en pmt-dashboard. */
export const CHART_PALETTE: string[] = [
  '#2563eb', // blue
  '#7c3aed', // purple
  '#16a34a', // green
  '#0891b2', // cyan
  '#4f46e5', // indigo
  '#d97706', // amber
  '#0d9488', // teal
  '#ea580c', // orange
  '#dc2626', // red
  '#64748b', // slate
];

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
