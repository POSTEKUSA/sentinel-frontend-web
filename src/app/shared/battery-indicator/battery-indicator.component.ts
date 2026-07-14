import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-battery-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <span class="battery-wrap" [matTooltip]="level + '%' + (charging ? ' (charging)' : '')">
      <mat-icon class="battery-icon" [ngClass]="colorClass">{{ icon }}</mat-icon>
      <span class="level-text">{{ level }}%</span>
    </span>
  `,
  styles: [`
    .battery-wrap {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 13px;
    }
    .battery-icon { font-size: 18px; width: 18px; height: 18px; }
    .level-text { font-weight: 500; }
    .critical { color: #e53935; }
    .low      { color: #fb8c00; }
    .medium   { color: #fdd835; }
    .good     { color: #43a047; }
  `],
})
export class BatteryIndicatorComponent {
  @Input() level: number = 100;
  @Input() charging: boolean = false;

  get icon(): string {
    if (this.charging) return 'battery_charging_full';
    if (this.level >= 80) return 'battery_full';
    if (this.level >= 60) return 'battery_5_bar';
    if (this.level >= 40) return 'battery_3_bar';
    if (this.level >= 20) return 'battery_1_bar';
    return 'battery_alert';
  }

  get colorClass(): string {
    if (this.charging) return 'good';
    if (this.level >= 60) return 'good';
    if (this.level >= 30) return 'medium';
    if (this.level >= 15) return 'low';
    return 'critical';
  }
}
