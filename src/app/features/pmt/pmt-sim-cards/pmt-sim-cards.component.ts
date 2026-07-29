import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PmtSimCardService } from '../../../core/services/pmt/pmt-sim-card.service';
import { SimCard, SimCardEstado, SIM_CARD_ESTADO_LABELS, SIM_CARD_ESTADO_BADGE } from '../../../core/models/pmt/sim-card.model';

@Component({
  selector: 'app-pmt-sim-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-sim-cards.component.html',
  styleUrl: './pmt-sim-cards.component.css',
})
export class PmtSimCardsComponent implements OnInit {
  private svc = inject(PmtSimCardService);
  private fb  = inject(FormBuilder);
  all: SimCard[] = [];
  filtered: SimCard[] = [];

  readonly estadoLabels = SIM_CARD_ESTADO_LABELS;
  readonly estadoBadge  = SIM_CARD_ESTADO_BADGE;
  readonly estadoKeys   = Object.keys(SIM_CARD_ESTADO_LABELS) as SimCardEstado[];
  readonly companias    = ['Claro', 'Tigo', 'Postek'];

  // dialog
  showForm = false;
  editId: number | null = null;
  formData = this.fb.group({
    iccid: [''], numero: [''], compania: ['Claro'],
    estado: ['disponible'], terminalSerie: [''], apn: [''], ip: [''], notes: [''],
  });
  formError = '';

  filterForm = this.fb.group({ q: [''], estado: [''], compania: [''] });

  ngOnInit(): void {
    this.svc.simCards$.subscribe(list => {
      this.all = list;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(s => {
      const q = (f.q ?? '').toLowerCase();
      if (q && ![s.iccid, s.numero, s.terminalSerie, s.assignedTo].some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.estado && s.estado !== f.estado) return false;
      if (f.compania && s.compania !== f.compania) return false;
      return true;
    });
  }

  openCreate(): void { this.editId = null; this.formData.reset({ compania: 'Claro', estado: 'disponible' }); this.formError = ''; this.showForm = true; }
  openEdit(s: SimCard): void { this.editId = s.id; this.formData.patchValue(s); this.formError = ''; this.showForm = true; }

  save(): void {
    const v = this.formData.getRawValue();
    if (!v.iccid?.trim()) { this.formError = 'ICCID requerido.'; return; }
    if (!v.compania?.trim()) { this.formError = 'Compañía requerida.'; return; }
    if (this.editId === null) {
      if (this.all.find(s => s.iccid === v.iccid)) { this.formError = `ICCID "${v.iccid}" ya existe.`; return; }
      this.svc.create({ iccid: v.iccid!, compania: v.compania!, estado: (v.estado as SimCardEstado) ?? 'disponible', numero: v.numero ?? undefined, terminalSerie: v.terminalSerie ?? undefined, apn: v.apn ?? undefined, ip: v.ip ?? undefined, notes: v.notes ?? undefined });
    } else {
      this.svc.update(this.editId, v as Partial<SimCard>);
    }
    this.showForm = false;
  }
}
