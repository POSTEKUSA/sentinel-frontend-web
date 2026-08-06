import {
  Component,
  Input,
  forwardRef,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface StatusOption {
  value: string;
  label: string;
  /** Color principal (texto / indicador). */
  color: string;
  /** Fondo suave cuando está seleccionado. */
  soft?: string;
}

/** Presets comunes — activo / inactivo / suspendido. */
export const STATUS_ACTIVE_INACTIVE_SUSPENDED: StatusOption[] = [
  { value: 'active', label: 'Activo', color: '#2a7c34', soft: '#edf7ee' },
  { value: 'inactive', label: 'Inactivo', color: '#8a929c', soft: '#f1f3f5' },
  { value: 'suspended', label: 'Suspendido', color: '#c1272d', soft: '#fbeaea' },
];

export const STATUS_ACTIVE_INACTIVE: StatusOption[] = [
  STATUS_ACTIVE_INACTIVE_SUSPENDED[0],
  STATUS_ACTIVE_INACTIVE_SUSPENDED[1],
];

/** Catálogo: activo / obsoleto / descontinuado. */
export const STATUS_CATALOG: StatusOption[] = [
  { value: 'active', label: 'Activo', color: '#2a7c34', soft: '#edf7ee' },
  { value: 'obsolete', label: 'Obsoleto', color: '#ca8a04', soft: '#fef9c3' },
  { value: 'discontinued', label: 'Descontinuado', color: '#8a929c', soft: '#f1f3f5' },
];

/**
 * Selector de estado tipo switch segmentado, con colores configurables.
 * Soporta CVA (formControlName / ngModel) y modo solo lectura (tabla).
 */
@Component({
  selector: 'app-status-switch',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StatusSwitchComponent),
      multi: true,
    },
  ],
  template: `
    @if (readonly) {
      <span
        class="ss ss--pill"
        [style.--ss-color]="current?.color ?? '#8a929c'"
        [style.--ss-soft]="current?.soft ?? '#f1f3f5'"
        [attr.title]="pillLabel">
        <span class="ss__label">{{ pillLabel }}</span>
      </span>
    } @else {
      <div
        class="ss ss--switch"
        role="radiogroup"
        [attr.aria-label]="ariaLabel"
        [class.ss--disabled]="disabled">
        @for (opt of options; track opt.value) {
          <button
            type="button"
            class="ss__seg"
            role="radio"
            [attr.aria-checked]="value === opt.value"
            [class.ss__seg--on]="value === opt.value"
            [disabled]="disabled"
            [style.--ss-color]="opt.color"
            [style.--ss-soft]="opt.soft || '#f1f3f5'"
            (click)="select(opt.value)">
            <span class="ss__label">{{ opt.label }}</span>
          </button>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        max-width: 100%;
        vertical-align: middle;
      }

      .ss {
        --ss-color: #8a929c;
        --ss-soft: #f1f3f5;
        font-family: inherit;
      }

      .ss__label {
        line-height: 1;
        white-space: nowrap;
      }

      .ss--pill {
        display: inline-flex;
        align-items: center;
        padding: 5px 10px;
        border-radius: 999px;
        background: var(--ss-soft);
        color: var(--ss-color);
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      .ss--switch {
        display: inline-flex;
        align-items: stretch;
        gap: 2px;
        padding: 3px;
        border-radius: 10px;
        background: #eef0f3;
        border: 1px solid var(--line, #e4e7eb);
      }

      .ss__seg {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: 7px 12px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--ink-3, #8a929c);
        font: inherit;
        font-size: 0.8rem;
        font-weight: 550;
        cursor: pointer;
        transition:
          background 0.14s ease,
          color 0.14s ease,
          box-shadow 0.14s ease;
      }

      .ss__seg:hover:not(:disabled):not(.ss__seg--on) {
        background: rgba(255, 255, 255, 0.65);
        color: var(--ink-2, #4a515b);
      }

      .ss__seg--on {
        background: var(--ss-soft);
        color: var(--ss-color);
        box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
      }

      .ss__seg:focus-visible {
        outline: 2px solid var(--ss-color);
        outline-offset: 1px;
      }

      .ss--disabled,
      .ss__seg:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
    `,
  ],
})
export class StatusSwitchComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  @Input() options: StatusOption[] = STATUS_ACTIVE_INACTIVE;
  @Input() readonly = false;
  @Input() ariaLabel = 'Estado';
  /** Binding directo sin forms cuando readonly. */
  @Input() set value(v: string | null | undefined) {
    this._value = v ?? '';
  }
  get value(): string {
    return this._value;
  }

  disabled = false;
  private _value = '';
  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get current(): StatusOption | undefined {
    return this.options.find(o => o.value === this._value);
  }

  get pillLabel(): string {
    return this.current?.label || this._value || '—';
  }

  select(v: string): void {
    if (this.disabled || this.readonly || v === this._value) return;
    this._value = v;
    this.onChange(v);
    this.onTouched();
    this.cdr.markForCheck();
  }

  writeValue(v: string | null): void {
    this._value = v ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
