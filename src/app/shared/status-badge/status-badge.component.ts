import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceStatus } from '../../core/models/device-summary.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide"
      [ngClass]="{
        'bg-ok-soft text-ok': status === 'online',
        'bg-warn-soft text-warn': status === 'delayed',
        'bg-danger-soft text-danger': status === 'offline'
      }">
      <span
        class="h-1.5 w-1.5 rounded-full"
        [ngClass]="{
          'bg-ok animate-pulse': status === 'online',
          'bg-warn': status === 'delayed',
          'bg-danger': status === 'offline'
        }"></span>
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status: DeviceStatus = 'offline';

  get label(): string {
    switch (this.status) {
      case 'online':
        return 'Online';
      case 'delayed':
        return 'Delayed';
      case 'offline':
        return 'Offline';
    }
  }
}
