import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { HeatmapData } from '../../../core/models/business-insights';
import { hexToRgba } from '../chart-palette';

/** Heatmap CSS (hora × día de la semana) — sin dependencias externas. */
@Component({
  selector: 'app-heatmap-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heatmap-grid.component.html',
  styleUrl: './heatmap-grid.component.css',
})
export class HeatmapGridComponent implements OnChanges {
  @Input() data: HeatmapData | null = null;
  @Input() color = '#0a5fa5';
  @Input() valueFormatter: (v: number) => string = v => v.toLocaleString('es-HN');

  private valueByKey = new Map<string, number>();

  ngOnChanges(): void {
    this.valueByKey.clear();
    if (!this.data) return;
    for (const cell of this.data.cells) {
      this.valueByKey.set(`${cell.dayIndex}-${cell.hour}`, cell.value);
    }
  }

  cellColor(dayIndex: number, hour: number): string {
    const value = this.valueByKey.get(`${dayIndex}-${hour}`) ?? 0;
    const max = this.data?.maxValue || 1;
    const alpha = value > 0 ? 0.08 + 0.84 * (value / max) : 0.04;
    return hexToRgba(this.color, alpha);
  }

  cellTitle(dayIndex: number, hour: number): string {
    const value = this.valueByKey.get(`${dayIndex}-${hour}`) ?? 0;
    const day = this.data?.dayLabels[dayIndex] ?? '';
    const hourLabel = this.data?.hourLabels[hour] ?? '';
    return `${day} ${hourLabel} — ${this.valueFormatter(value)}`;
  }

  showHourLabel(index: number): boolean {
    return index % 3 === 0;
  }
}
