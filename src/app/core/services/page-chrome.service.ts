import { Injectable, signal } from '@angular/core';

/** Optional subtitle / freshness line shown in the shell topbar. */
@Injectable({ providedIn: 'root' })
export class PageChromeService {
  readonly subtitle = signal<string | null>(null);

  setSubtitle(text: string | null): void {
    this.subtitle.set(text);
  }

  clear(): void {
    this.subtitle.set(null);
  }
}
