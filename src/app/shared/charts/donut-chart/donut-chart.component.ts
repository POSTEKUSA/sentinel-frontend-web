import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { DistributionSlice } from '../../../core/models/business-insights';
import { paletteColor } from '../chart-palette';

interface DonutSegment {
  dasharray: string;
  dashoffset: number;
  color: string;
}

/** Donut SVG (stroke-dasharray) con leyenda — usado para distribución por MCC / tarjeta / moneda. */
@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.css',
})
export class DonutChartComponent implements OnChanges {
  @Input() data: DistributionSlice[] = [];
  @Input() size = 148;
  @Input() totalLabel = 'Total';
  @Input() valueFormatter: (v: number) => string = v => v.toLocaleString('es-HN');
  @Input() emptyMessage = 'Sin datos para el período seleccionado';

  segments: DonutSegment[] = [];
  total = 0;

  private readonly radius = 40;
  private readonly circumference = 2 * Math.PI * this.radius;

  ngOnChanges(): void {
    this.total = this.data.reduce((a, d) => a + d.value, 0);
    let cumulative = 0;
    this.segments = this.data.map(d => {
      const fraction = this.total ? d.value / this.total : 0;
      const dash = fraction * this.circumference;
      const seg: DonutSegment = {
        dasharray: `${dash.toFixed(2)} ${(this.circumference - dash).toFixed(2)}`,
        dashoffset: -cumulative,
        color: paletteColor(d.colorIndex),
      };
      cumulative += dash;
      return seg;
    });
  }

  paletteColor(index: number): string {
    return paletteColor(index);
  }
}
