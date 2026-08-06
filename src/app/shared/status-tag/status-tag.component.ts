import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Tonos del sistema cf-badge (usuarios / inventario). */
export type StatusTone = 'ok' | 'off' | 'warn' | 'info' | 'muted';

export interface StatusTagOption {
  value: string;
  label: string;
  tone: StatusTone;
}

export const STATUS_TAG_ACTIVE_INACTIVE: StatusTagOption[] = [
  { value: 'active', label: 'Activo', tone: 'ok' },
  { value: 'inactive', label: 'Inactivo', tone: 'off' },
];

export const STATUS_TAG_CATALOG: StatusTagOption[] = [
  { value: 'active', label: 'Activo', tone: 'ok' },
  { value: 'obsolete', label: 'Obsoleto', tone: 'warn' },
  { value: 'discontinued', label: 'Descontinuado', tone: 'muted' },
];

const TONE_CLASS: Record<StatusTone, string> = {
  ok: 'cf-badge-ok',
  off: 'cf-badge-off',
  warn: 'cf-badge-warn',
  info: 'cf-badge-info',
  muted: 'cf-badge-muted',
};

/**
 * Badge de estado reutilizable para grids.
 * Define textos y tonos vía `options`, o pásalos directo con `label` + `tone`.
 */
@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="cf-badge" [ngClass]="badgeClass" [attr.title]="resolvedLabel">
      <span class="dot"></span>{{ resolvedLabel }}
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        vertical-align: middle;
      }
    `,
  ],
})
export class StatusTagComponent {
  /** Valor a resolver contra `options`. */
  @Input() value: string | boolean | null | undefined;

  /** Mapa value → label + tone. */
  @Input() options: StatusTagOption[] = [];

  /** Texto directo (si no usas options). */
  @Input() label = '';

  /** Tono directo (si no usas options). */
  @Input() tone: StatusTone = 'muted';

  get resolved(): StatusTagOption | undefined {
    if (this.value === null || this.value === undefined || this.value === '') {
      return undefined;
    }
    const key = String(this.value);
    return this.options.find(o => o.value === key);
  }

  get resolvedLabel(): string {
    return this.resolved?.label || this.label || (this.value != null && this.value !== '' ? String(this.value) : '—');
  }

  get badgeClass(): string {
    const tone = this.resolved?.tone ?? this.tone;
    return TONE_CLASS[tone] ?? TONE_CLASS.muted;
  }
}
