import { Injectable, signal } from '@angular/core';

const DEFAULT_MESSAGE = 'Cargando';

@Injectable({ providedIn: 'root' })
export class BusyLoaderService {
  private readonly _visible = signal(false);
  private readonly _message = signal(DEFAULT_MESSAGE);
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private depth = 0;
  /** When false, Router NavigationStart/End must not toggle the loader. */
  private navTracking = true;

  readonly visible = this._visible.asReadonly();
  readonly message = this._message.asReadonly();

  allowsNavTracking(): boolean {
    return this.navTracking;
  }

  suspendNavTracking(): void {
    this.navTracking = false;
  }

  resumeNavTracking(): void {
    this.navTracking = true;
  }

  /** Show overlay. Optional message; defaults to "Cargando". */
  show(message = DEFAULT_MESSAGE): void {
    this._message.set(message);
    this.depth += 1;
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    // Timed auth transitions need the overlay immediately
    if (!this.navTracking || this.depth > 1) {
      if (this.showTimer) {
        clearTimeout(this.showTimer);
        this.showTimer = null;
      }
      this._visible.set(true);
      return;
    }
    if (this.depth === 1) {
      this.showTimer = setTimeout(() => {
        if (this.depth > 0) this._visible.set(true);
      }, 80);
    }
  }

  /** Update message while overlay already visible. */
  setMessage(message: string): void {
    this._message.set(message);
  }

  hide(): void {
    this.depth = Math.max(0, this.depth - 1);
    if (this.depth > 0) return;
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this.hideTimer = setTimeout(() => {
      this._visible.set(false);
      this._message.set(DEFAULT_MESSAGE);
      this.hideTimer = null;
    }, 120);
  }

  /** Force-hide regardless of nesting. */
  reset(): void {
    this.depth = 0;
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.showTimer = null;
    this.hideTimer = null;
    this._visible.set(false);
    this._message.set(DEFAULT_MESSAGE);
  }
}
