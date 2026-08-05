import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export type KpiCardColor =
  | 'blue' | 'purple' | 'green' | 'cyan' | 'indigo' | 'amber' | 'teal' | 'orange' | 'red' | 'slate';

/** Card de KPI reutilizable — generaliza el markup duplicado en dashboard.component.html / pmt-dashboard.component.html. */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.css',
})
export class KpiCardComponent {
  @Input() icon = 'insights';
  @Input() value = '';
  @Input() label = '';
  @Input() sublabel = '';
  @Input() color: KpiCardColor = 'blue';
  /** Cambio porcentual opcional (positivo = verde, negativo = rojo). */
  @Input() trend: number | null = null;
  @Input() routerLink: string | unknown[] | null = null;
  @Input() queryParams: Record<string, unknown> | null = null;
}
