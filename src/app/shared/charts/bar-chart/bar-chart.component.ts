import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ChartPoint } from '../../../core/models/business-insights';

/** Gráfico de barras verticales en CSS puro — usado para ventas por mes / comparación mensual. */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent implements OnChanges {
  @Input() data: ChartPoint[] = [];
  @Input() color = '#0a5fa5';
  @Input() height = 220;
  @Input() highlightLastIndex = false;
  @Input() valueFormatter: (v: number) => string = v => v.toLocaleString('es-HN');
  @Input() emptyMessage = 'Sin datos para el período seleccionado';

  maxValue = 1;

  ngOnChanges(): void {
    this.maxValue = Math.max(...this.data.map(d => d.value), 1);
  }

  pct(value: number): number {
    return this.maxValue ? Math.max((value / this.maxValue) * 100, value > 0 ? 2 : 0) : 0;
  }
}
