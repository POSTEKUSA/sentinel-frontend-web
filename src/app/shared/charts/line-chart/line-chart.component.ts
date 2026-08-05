import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ChartPoint } from '../../../core/models/business-insights';

interface LinePoint {
  x: number;
  y: number;
}

/** Gráfico de línea SVG liviano (sin dependencias) — usado para series de ventas por hora/día e históricos. */
@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent implements OnChanges {
  @Input() data: ChartPoint[] = [];
  @Input() color = '#0a5fa5';
  @Input() height = 220;
  @Input() valueFormatter: (v: number) => string = v => v.toLocaleString('es-HN');
  @Input() emptyMessage = 'Sin datos para el período seleccionado';

  readonly viewboxWidth = 600;

  points: LinePoint[] = [];
  linePath = '';
  areaPath = '';
  gridLines: number[] = [];
  hoveredIndex: number | null = null;

  ngOnChanges(): void {
    this.rebuild();
  }

  private rebuild(): void {
    if (!this.data.length) {
      this.points = [];
      this.linePath = '';
      this.areaPath = '';
      return;
    }
    const max = Math.max(...this.data.map(d => d.value), 1);
    const n = this.data.length;
    const topPad = 10;
    const bottomPad = 10;
    const usableHeight = this.height - topPad - bottomPad;
    const stepX = n > 1 ? this.viewboxWidth / (n - 1) : 0;

    this.points = this.data.map((d, i) => ({
      x: n > 1 ? i * stepX : this.viewboxWidth / 2,
      y: topPad + usableHeight - (d.value / max) * usableHeight,
    }));

    this.linePath = this.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    const baseline = topPad + usableHeight;
    const last = this.points[this.points.length - 1];
    const first = this.points[0];
    this.areaPath = `${this.linePath} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z`;

    this.gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => baseline - f * usableHeight);
  }

  onMove(evt: MouseEvent): void {
    if (!this.points.length) return;
    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const ratio = (evt.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (this.points.length - 1));
    this.hoveredIndex = Math.min(Math.max(idx, 0), this.points.length - 1);
  }

  onLeave(): void {
    this.hoveredIndex = null;
  }

  tooltipLeftPct(): number {
    if (this.hoveredIndex === null) return 0;
    return (this.points[this.hoveredIndex].x / this.viewboxWidth) * 100;
  }
}
