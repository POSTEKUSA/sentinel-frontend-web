import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceStatus } from '../../core/models/device-summary.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="cf-badge"
      [ngClass]="{
        'cf-badge-ok': status === 'online',
        'cf-badge-warn': status === 'delayed',
        'cf-badge-off': status === 'offline'
      }">
      <span class="dot" [class.cf-badge-dot-pulse]="status === 'online'"></span>
      {{ label }}
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .cf-badge-dot-pulse {
        animation: cfBadgePulse 1.6s ease-in-out infinite;
      }
      @keyframes cfBadgePulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.35;
        }
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() status: DeviceStatus = 'offline';

  get label(): string {
    switch (this.status) {
      case 'online':
        return 'En línea';
      case 'delayed':
        return 'Retrasado';
      case 'offline':
        return 'Fuera de línea';
    }
  }
}
