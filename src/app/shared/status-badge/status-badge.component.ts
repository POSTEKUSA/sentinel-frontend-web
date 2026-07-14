import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { DeviceStatus } from '../../core/models/device-summary.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <span class="status-badge" [ngClass]="'status-' + status">
      <span class="dot"></span>
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .status-online  { background: #e8f5e9; color: #2e7d32; }
    .status-delayed { background: #fff8e1; color: #f57f17; }
    .status-offline { background: #fce4ec; color: #c62828; }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .status-online .dot {
      background: #43a047;
      animation: pulse 1.6s infinite;
    }
    .status-delayed .dot {
      background: #fb8c00;
    }
    .status-offline .dot {
      background: #e53935;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(1.3); }
    }
  `],
})
export class StatusBadgeComponent {
  @Input() status: DeviceStatus = 'offline';

  get label(): string {
    switch (this.status) {
      case 'online':  return 'Online';
      case 'delayed': return 'Delayed';
      case 'offline': return 'Offline';
    }
  }
}
