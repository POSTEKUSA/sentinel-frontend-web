import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { Terminal, TerminalEstado } from '../../../core/models/pmt/terminal.model';

/* ─── Field mapping for bulk terminal upload ── */
const COL_MAP: Record<string, string> = {
  serie: 'serie', 'n° serie': 'serie', serial: 'serie', numero_serie: 'serie',
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
  comunicacion: 'comunicacion', conexion: 'comunicacion', connection: 'comunicacion', chip: 'chip', ip: 'ip', sim: 'chip',
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

function norm(k: string): string { return k.toLowerCase().trim().replace(/\s+/g, ' '); }

function mapRow(raw: Record<string, any>): Record<string, string> {
  const r: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const mapped = COL_MAP[norm(String(k))];
    if (mapped) r[mapped] = v != null ? String(v).trim() : '';
  }
  if (!r['estado']) r['estado'] = 'en_bodega';
  else { const n = STATUS_MAP[norm(r['estado'])]; if (n) r['estado'] = n; }
  return r;
}

@Component({
  selector: 'app-pmt-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pmt-bulk-upload.component.html',
  styleUrl: './pmt-bulk-upload.component.css',
})
export class PmtBulkUploadComponent {
  private svc = inject(PmtTerminalService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'csv' | 'json' = 'csv';
  fileName: string | null = null;
  parsedData: Partial<Terminal>[] | null = null;
  parseError: string | null = null;
  jsonInput = '';
  uploadResult: { created: number; errors: any[] } | null = null;

  readonly previewCols = ['serie','modelo','estado','nombre','ciudad'];

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileName = file.name;
    this.parseError = null; this.parsedData = null; this.uploadResult = null;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target!.result as string;
        const rows = this.parseCsv(text);
        if (!rows.length) { this.parseError = 'El archivo está vacío.'; this.cdr.detectChanges(); return; }
        const invalid = rows.filter(r => !r['serie']);
        if (invalid.length) { this.parseError = `${invalid.length} fila(s) sin SERIE.`; this.cdr.detectChanges(); return; }
        this.parsedData = rows as Partial<Terminal>[];
      } catch { this.parseError = 'Error al leer el archivo.'; }
      this.cdr.detectChanges();
    };
    reader.readAsText(file, 'UTF-8');
    input.value = '';
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

  parseJson(): void {
    this.parseError = null; this.parsedData = null; this.uploadResult = null;
    if (!this.jsonInput.trim()) { this.parseError = 'Ingrese datos JSON.'; return; }
    try {
      const data = JSON.parse(this.jsonInput);
      if (!Array.isArray(data) || !data.length) { this.parseError = 'El JSON debe ser un array no vacío.'; return; }
      const invalid = data.filter(r => !r.serie);
      if (invalid.length) { this.parseError = `${invalid.length} fila(s) sin campo "serie".`; return; }
      this.parsedData = data.map(r => mapRow(r));
    } catch (e: any) { this.parseError = e.message || 'Error de sintaxis JSON.'; }
  }

  upload(): void {
    if (!this.parsedData) return;
    this.uploadResult = this.svc.bulkImport(this.parsedData);
    this.parsedData = null;
    this.fileName = null;
    this.jsonInput = '';
  }

  downloadTemplate(): void {
    const headers = 'serie,modelo,estado,inventario,zona,caja,inyectado,fecha,nombre,ciudad,comunicacion,version\n';
    const example1 = 'SN123456,VX520,en_bodega,INV-001,Norte,1,,2023-10-01,Comercio A,Santiago,GPRS,v1.0\n';
    const example2 = 'SN789012,PAX A920,instalado,INV-002,Sur,2,,2023-10-05,Comercio B,Valparaíso,WIFI,v2.1\n';
    const blob = new Blob([headers + example1 + example2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_inventario.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  reset(): void { this.parsedData = null; this.parseError = null; this.uploadResult = null; this.fileName = null; this.jsonInput = ''; }
  colLabel(c: string): string { const m: Record<string,string> = {serie:'Serie',modelo:'Modelo',estado:'Estado',nombre:'Comercio',ciudad:'Ciudad'}; return m[c] ?? c; }
  colValue(r: any, c: string): string { return r[c] ?? '—'; }
}
