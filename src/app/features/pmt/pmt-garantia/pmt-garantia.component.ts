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
  serieVieja = '';
  serieNueva = '';
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

  sustituir(): void {
    this.sustitucionError = '';
    if (!this.serieVieja.trim() || !this.serieNueva.trim()) {
      this.sustitucionError = 'Ambas series son requeridas.'; return;
    }
    const vieja = this.svc.terminals.find(t => t.serie === this.serieVieja.trim());
    if (!vieja) { this.sustitucionError = `Serie "${this.serieVieja}" no encontrada.`; return; }
    // Mark old as substituted and create new in bodega
    this.svc.changeEstado(vieja.id, 'serie_sustituida', `Sustituida por ${this.serieNueva}`);
    this.svc.create({ serie: this.serieNueva.trim(), estado: 'en_bodega', modelo: vieja.modelo, zona: vieja.zona });
    this.serieVieja = ''; this.serieNueva = '';
    this.showSustitucion = false;
  }

  retirar(t: Terminal): void {
    if (confirm(`¿Confirmar retiro de garantía del terminal ${t.serie}?`))
      this.svc.changeEstado(t.id, 'retirado', 'Retirado de garantía');
  }
}
