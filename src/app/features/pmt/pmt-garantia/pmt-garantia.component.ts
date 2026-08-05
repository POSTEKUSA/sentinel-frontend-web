import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { Terminal, TERMINAL_ESTADO_LABELS } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-garantia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-garantia.component.html',
  styleUrl: './pmt-garantia.component.css',
})
export class PmtGarantiaComponent implements OnInit {
  private svc = inject(PmtTerminalService);
  private fb  = inject(FormBuilder);
  all: Terminal[] = [];
  filtered: Terminal[] = [];
  readonly estadoLabels = TERMINAL_ESTADO_LABELS;

  showSustitucion = false;
  terminalASustituir: Terminal | null = null;
  serieRegistro = '';
  codigoSerie = '';
  sustitucionError = '';

  filterForm = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts.filter(t => t.estado === 'garantia');
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const q = (this.filterForm.value.q ?? '').toLowerCase().trim();
    this.filtered = q ? this.all.filter(t => [t.serie, t.modelo].some(v => (v ?? '').toLowerCase().includes(q))) : [...this.all];
  }

  abrirSustitucion(t: Terminal): void {
    this.terminalASustituir = t;
    this.serieRegistro = t.serie;
    this.codigoSerie = '';
    this.sustitucionError = '';
    this.showSustitucion = true;
  }

  cerrarSustitucion(): void {
    this.showSustitucion = false;
    this.terminalASustituir = null;
    this.serieRegistro = '';
    this.codigoSerie = '';
    this.sustitucionError = '';
  }

  sustituir(): void {
    this.sustitucionError = '';
    if (!this.serieRegistro.trim() || !this.codigoSerie.trim()) {
      this.sustitucionError = 'Serie de registro y código de serie son requeridos.'; return;
    }
    const vieja = this.terminalASustituir
      ?? this.svc.terminals.find(t => t.serie === this.serieRegistro.trim());
    if (!vieja) { this.sustitucionError = `Serie "${this.serieRegistro}" no encontrada.`; return; }
    const nueva = this.codigoSerie.trim();
    const dup = this.svc.terminals.find(t => t.serie.toLowerCase() === nueva.toLowerCase());
    if (dup) { this.sustitucionError = `El código de serie "${nueva}" ya existe.`; return; }
    this.svc.changeEstado(vieja.id, 'serie_sustituida', `Sustituida por ${nueva}`);
    this.svc.create({ serie: nueva, estado: 'en_bodega', modelo: vieja.modelo, zona: vieja.zona, inventario: vieja.inventario });
    this.cerrarSustitucion();
  }

  terminalARetirar: Terminal | null = null;

  retirar(t: Terminal): void {
    this.terminalARetirar = t;
  }

  confirmarRetiro(): void {
    if (this.terminalARetirar) {
      this.svc.changeEstado(this.terminalARetirar.id, 'retirado', 'Retirado de garantía');
      this.terminalARetirar = null;
    }
  }
}
