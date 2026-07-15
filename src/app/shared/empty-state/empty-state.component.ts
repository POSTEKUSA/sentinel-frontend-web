import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Icons shared with the shell navbar / topbar. */
export type NavIconName =
  | 'dashboard'
  | 'devices'
  | 'map'
  | 'catalog'
  | 'orders'
  | 'receiving'
  | 'inventory'
  | 'merchants';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="cf-empty-state">
      @if (navIcon) {
        <span class="cf-empty-svg" aria-hidden="true">
          @switch (navIcon) {
            @case ('dashboard') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            }
            @case ('devices') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
            }
            @case ('map') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" />
                <path d="M9 3v16M15 5v16" />
              </svg>
            }
            @case ('catalog') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 5h7v14H4zM13 5h7v6h-7zM13 13h7v6h-7z" />
              </svg>
            }
            @case ('orders') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 3h10v18H7z" />
                <path d="M10 7h4M10 11h4M10 15h3" />
              </svg>
            }
            @case ('receiving') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 7h16v12H4z" />
                <path d="M8 7V5h8v2M12 11v5M9.5 14.5 12 17l2.5-2.5" />
              </svg>
            }
            @case ('inventory') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 7 12 3l9 4v10l-9 4-9-4V7Z" />
                <path d="M12 12v9M3 7l9 5 9-5" />
              </svg>
            }
            @case ('merchants') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 7 6.5 3.5h11L21 7" />
                <path d="M3 7h18v2.5a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 9.5V7Z" />
                <path d="M5 12v8h14v-8" />
                <path d="M10 20v-5h4v5" />
                <path d="M7 15h2M15 15h2" />
              </svg>
            }
          }
        </span>
      } @else {
        <span class="mi cf-empty-icon" aria-hidden="true">{{ icon }}</span>
      }
      <p class="cf-empty-title">{{ title }}</p>
      @if (subtitle) {
        <p class="cf-empty-subtitle">{{ subtitle }}</p>
      }
    </div>
  `,
  styles: [
    `
      .cf-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        padding: 56px 32px;
        min-height: 240px;
      }

      .cf-empty-svg {
        display: grid;
        place-items: center;
        width: 64px;
        height: 64px;
        margin: 0 0 16px;
        color: var(--ink-3);
        opacity: 0.7;
      }

      .cf-empty-svg svg {
        width: 48px;
        height: 48px;
        stroke-width: 1.6;
      }

      .cf-empty-icon {
        display: grid !important;
        place-items: center;
        width: 64px;
        height: 64px;
        margin: 0 0 16px;
        font-size: 48px !important;
        line-height: 1 !important;
        color: var(--ink-3);
        opacity: 0.55;
      }

      .cf-empty-title {
        margin: 0 0 6px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--ink-2);
        text-align: center;
        max-width: 420px;
      }

      .cf-empty-subtitle {
        margin: 0;
        font-size: 0.84rem;
        line-height: 1.45;
        color: var(--ink-3);
        text-align: center;
        max-width: 420px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  /** Material Icons fallback when `navIcon` is not set. */
  @Input() icon = 'devices_off';
  /** Prefer this — same SVG as the sidebar / topbar. */
  @Input() navIcon: NavIconName | null = null;
  @Input() title = 'No devices found';
  @Input() subtitle = '';
}
