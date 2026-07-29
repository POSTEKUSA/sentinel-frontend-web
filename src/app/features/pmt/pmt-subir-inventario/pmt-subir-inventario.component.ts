import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { Terminal, TerminalEstado } from '../../../core/models/pmt/terminal.model';

/* ─── Column mapping (same logic as PMT's subir-inventario) ───────────── */
const COL_MAP: Record<string, string> = {
  serie: 'serie', 'n° serie': 'serie', numero_serie: 'serie',
  modelo: 'modelo', model: 'modelo',
  estado: 'estado', status: 'estado',
  inventario: 'inventario', inventory: 'inventario', 'n° inventario': 'inventario',
  zona: 'zona', zone: 'zona',
  caja: 'caja', box: 'caja',
  inyectado: 'inyectado', injected: 'inyectado',
  fecha: 'fecha', registration_date: 'fecha', 'fecha registro': 'fecha', 'fecha instalacion': 'fecha',
  nombre: 'nombre', comercio: 'nombre', 'nombre comercio': 'nombre',
  codigo: 'codigo', 'codigo comercio': 'codigo',
  terminal: 'terminal', tid: 'terminal', terminal_id: 'terminal',
  direccion: 'direccion', address: 'direccion',
  ciudad: 'ciudad', city: 'ciudad',
  comunicacion: 'comunicacion', conexion: 'comunicacion', connection: 'comunicacion',
  chip: 'chip', sim: 'chip',
  version: 'version', 'version app': 'version', versionapp: 'version',
};

const STATUS_MAP: Record<string, TerminalEstado> = {
  bodega: 'en_bodega', 'en bodega': 'en_bodega', en_bodega: 'en_bodega',
  inyeccion: 'en_inyeccion', 'en inyeccion': 'en_inyeccion', en_inyeccion: 'en_inyeccion',
  instalado: 'instalado', activo: 'instalado', active: 'instalado',
  reparacion: 'en_reparacion', 'en reparacion': 'en_reparacion', en_reparacion: 'en_reparacion',
  garantia: 'garantia',
  obsoleto: 'obsoleto',
  retirado: 'retirado',
};

function normalizeKey(k: string): string { return k.toLowerCase().trim().replace(/\s+/g, ' '); }

function mapRow(raw: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [rawKey, rawVal] of Object.entries(raw)) {
    const norm = normalizeKey(String(rawKey));
    const mapped = COL_MAP[norm];
    if (mapped) {
      const val = rawVal != null ? String(rawVal).trim() : '';
      result[mapped] = val;
    }
  }
  if (!result['estado']) result['estado'] = 'en_bodega';
  else {
    const norm = STATUS_MAP[normalizeKey(result['estado'])];
    if (norm) result['estado'] = norm;
  }
  return result;
}

@Component({
  selector: 'app-pmt-subir-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pmt-subir-inventario.component.html',
  styleUrl: './pmt-subir-inventario.component.css',
})
export class PmtSubirInventarioComponent {
  private svc = inject(PmtTerminalService);

  fileName: string | null = null;
  parsedData: Partial<Terminal>[] | null = null;
  parseError: string | null = null;
  uploadResult: { created: number; errors: any[] } | null = null;

  readonly previewCols = ['serie','inventario','modelo','estado','zona','caja','inyectado','fecha','nombre'];

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileName = file.name;
    this.parseError = null;
    this.parsedData = null;
    this.uploadResult = null;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target!.result as string;
        const rows = this.parseFile(file.name, text);
        if (!rows.length) { this.parseError = 'El archivo está vacío o no tiene datos.'; return; }
        const invalid = rows.filter(r => !r['serie']);
        if (invalid.length) { this.parseError = `${invalid.length} fila(s) sin campo SERIE requerido.`; return; }
        this.parsedData = rows as Partial<Terminal>[];
      } catch (err: any) {
        this.parseError = 'No se pudo leer el archivo. Verifique que sea un CSV o Excel válido.';
      }
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file, 'UTF-8');
    else reader.readAsBinaryString(file);
    input.value = '';
  }

  private parseFile(name: string, content: string): Record<string, any>[] {
    // CSV only (Excel requires SheetJS which must be installed; fallback gracefully)
    if (name.toLowerCase().endsWith('.csv')) {
      return this.parseCsv(content);
    }
    // For .xlsx files in this prototype we attempt JSON if dropped, otherwise show msg
    throw new Error('Para archivos .xlsx instale SheetJS. Por ahora use CSV.');
  }

  private parseCsv(text: string): Record<string, any>[] {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const raw: Record<string, any> = {};
      headers.forEach((h, i) => { raw[h] = values[i] ?? ''; });
      return mapRow(raw);
    });
  }

  upload(): void {
    if (!this.parsedData) return;
    this.uploadResult = this.svc.bulkImport(this.parsedData);
    this.parsedData = null;
    this.fileName = null;
  }

  reset(): void {
    this.parsedData = null;
    this.parseError = null;
    this.uploadResult = null;
    this.fileName = null;
  }

  colLabel(col: string): string {
    const m: Record<string,string> = { serie:'Serie', inventario:'Inv.', modelo:'Modelo', estado:'Estado', zona:'Zona', caja:'Caja', inyectado:'Inyectado', fecha:'Fecha', nombre:'Comercio' };
    return m[col] ?? col;
  }
  colValue(row: any, col: string): string { return row[col] ?? '—'; }
}
