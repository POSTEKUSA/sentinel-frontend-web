import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <p class="empty-title">{{ title }}</p>
      @if (subtitle) {
        <p class="empty-subtitle">{{ subtitle }}</p>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: rgba(0,0,0,0.38);
    }
    .empty-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
    }
    .empty-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 4px;
    }
    .empty-subtitle {
      font-size: 13px;
      margin: 0;
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'devices_off';
  @Input() title = 'No devices found';
  @Input() subtitle = '';
}
