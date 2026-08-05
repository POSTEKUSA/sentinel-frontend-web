import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RankedPoint } from '../../../core/models/business-insights';

/** Lista de barras horizontales rankeadas — generaliza el patrón `.zone-bars` de pmt-dashboard. */
@Component({
  selector: 'app-ranked-bar-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ranked-bar-list.component.html',
  styleUrl: './ranked-bar-list.component.css',
})
export class RankedBarListComponent implements OnChanges {
  @Input() data: RankedPoint[] = [];
  @Input() color = '#0a5fa5';
  @Input() valueFormatter: (v: number) => string = v => v.toLocaleString('es-HN');
  @Input() secondaryFormatter: (v: number) => string = v => `${v.toLocaleString('es-HN')} tx`;
  @Input() emptyMessage = 'Sin datos para el período seleccionado';
  @Input() linkFn: ((item: RankedPoint) => unknown[] | null) | null = null;

  maxValue = 1;

  ngOnChanges(): void {
    this.maxValue = Math.max(...this.data.map(d => d.value), 1);
  }

  pct(value: number): number {
    return this.maxValue ? (value / this.maxValue) * 100 : 0;
  }

  linkFor(item: RankedPoint): unknown[] | null {
    return this.linkFn ? this.linkFn(item) : null;
  }
}
