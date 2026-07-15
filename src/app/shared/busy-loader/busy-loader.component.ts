import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusyLoaderService } from '../../core/services/busy-loader.service';

@Component({
  selector: 'app-busy-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show) {
      <div
        class="loader-overlay"
        [class.inline]="inline"
        role="status"
        aria-live="polite"
        aria-busy="true"
        [attr.aria-label]="label">
        <div class="loader-logo-wrap">
          <span class="loader-ring" aria-hidden="true"></span>
          <img
            class="loader-logo"
            src="logo-postek.png"
            width="62"
            height="62"
            alt=""
            aria-hidden="true" />
        </div>
        <p class="loader-text">
          {{ label }}
          <span class="dots" aria-hidden="true">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </p>
      </div>
    }
  `,
})
export class BusyLoaderComponent {
  private busy = inject(BusyLoaderService);

  @Input() show = true;
  /** Inline covers parent instead of the whole viewport. */
  @Input() inline = false;
  /** Override label; otherwise uses BusyLoaderService message. */
  @Input() message: string | null = null;

  get label(): string {
    return this.message ?? this.busy.message();
  }
}
