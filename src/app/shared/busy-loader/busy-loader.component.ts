import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
        aria-label="Cargando">
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
      </div>
    }
  `,
})
export class BusyLoaderComponent {
  @Input() show = true;
  /** Inline covers parent instead of the whole viewport. */
  @Input() inline = false;
}
