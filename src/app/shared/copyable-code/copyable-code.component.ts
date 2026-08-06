import { Component, Input } from '@angular/core';

/**
 * Displays an ID / inventory code / serial with a one-click copy control.
 * Use in grids and detail views wherever monospace codes appear.
 */
@Component({
  selector: 'app-copyable-code',
  standalone: true,
  template: `
    @if (hasValue) {
      <span class="copyable-code" [class.is-copied]="copied">
        <span class="code copyable-code__value" [attr.title]="display">{{ display }}</span>
        <button
          type="button"
          class="copyable-code__btn"
          [attr.aria-label]="copied ? 'Copiado' : copyLabel"
          [title]="copied ? 'Copiado' : 'Copiar'"
          (click)="copy($event)">
          <span class="mi" aria-hidden="true">{{ copied ? 'check' : 'content_copy' }}</span>
        </button>
      </span>
    } @else {
      <span class="copyable-code copyable-code--empty">{{ empty }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        max-width: 100%;
        vertical-align: middle;
      }

      .copyable-code {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        max-width: 100%;
        min-width: 0;
      }

      .copyable-code--empty {
        color: var(--ink-3, #9ca3af);
        font-size: 0.9rem;
      }

      .copyable-code__value {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: all;
      }

      .copyable-code__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 22px;
        height: 22px;
        margin: 0;
        padding: 0;
        border: none;
        border-radius: 5px;
        background: transparent;
        color: var(--ink-3, #9ca3af);
        cursor: pointer;
        opacity: 0.55;
        transition: opacity 0.12s ease, background 0.12s ease, color 0.12s ease;
      }

      .copyable-code__btn .mi {
        font-size: 15px;
        line-height: 1;
      }

      .copyable-code:hover .copyable-code__btn,
      .copyable-code__btn:focus-visible {
        opacity: 1;
        background: var(--surface-alt, #f3f4f6);
        color: var(--ink-2, #4b5563);
      }

      .copyable-code__btn:hover {
        color: var(--ink-1, #111827);
      }

      .copyable-code.is-copied .copyable-code__btn {
        opacity: 1;
        color: #2a7c34;
        background: #edf7ee;
      }

      @media (hover: none) {
        .copyable-code__btn {
          opacity: 0.75;
        }
      }
    `,
  ],
})
export class CopyableCodeComponent {
  /** Raw code / serial / ID to display and copy. */
  @Input() value: string | number | null | undefined;

  /** Placeholder when value is empty. */
  @Input() empty = '—';

  /** Optional aria context, e.g. "serie" → "Copiar serie". */
  @Input() label = '';

  copied = false;
  private copiedTimer: ReturnType<typeof setTimeout> | null = null;

  get display(): string {
    if (this.value === null || this.value === undefined) return '';
    return String(this.value).trim();
  }

  get hasValue(): boolean {
    return this.display.length > 0;
  }

  get copyLabel(): string {
    return this.label ? `Copiar ${this.label}` : 'Copiar código';
  }

  async copy(event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    if (!this.hasValue) return;

    const text = this.display;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        this.fallbackCopy(text);
      }
      this.flashCopied();
    } catch {
      try {
        this.fallbackCopy(text);
        this.flashCopied();
      } catch {
        /* ignore */
      }
    }
  }

  private flashCopied(): void {
    this.copied = true;
    if (this.copiedTimer) clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => {
      this.copied = false;
      this.copiedTimer = null;
    }, 1400);
  }

  private fallbackCopy(text: string): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}
