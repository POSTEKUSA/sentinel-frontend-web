import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battery-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-0.5 text-[13px]"
      [attr.title]="level + '%' + (charging ? ' (charging)' : '')">
      <span class="mi text-[18px]" [ngClass]="colorClass">{{ icon }}</span>
      <span class="font-medium">{{ level }}%</span>
    </span>
  `,
  styles: [
    `
      .critical {
        color: #e53935;
      }
      .low {
        color: #fb8c00;
      }
      .medium {
        color: #fdd835;
      }
      .good {
        color: #43a047;
      }
    `,
  ],
})
export class BatteryIndicatorComponent {
  @Input() level = 100;
  @Input() charging = false;

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
