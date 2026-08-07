import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CopyableCodeComponent } from '../copyable-code/copyable-code.component';
import { EmptyStateComponent, NavIconName } from '../empty-state/empty-state.component';
import { StatusTagComponent } from '../status-tag/status-tag.component';
import { ListSort } from './list-query';
import {
  DataGridAction,
  DataGridActionEvent,
  DataGridActionKind,
  DataGridColumn,
  DataGridQueryChange,
} from './data-grid.types';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    FormsModule,
    CopyableCodeComponent,
    EmptyStateComponent,
    StatusTagComponent,
  ],
  template: `
    @if (total === 0) {
      <app-empty-state
        [navIcon]="emptyNavIcon"
        [icon]="emptyIcon"
        [title]="emptyTitle"
        [subtitle]="emptySubtitle" />
    } @else {
      <div class="admin-table-wrap">
        <table class="cf-table dg-table">
          <thead>
            <tr>
              @for (col of columns; track col.key) {
                <th [class]="headerClass(col)">
                  @if (col.sortable) {
                    <button type="button" class="dg-sort-btn" (click)="toggleSort(col.key)">
                      <span>{{ col.header }}</span>
                      <span class="mi dg-sort-icon" aria-hidden="true">{{ sortIcon(col.key) }}</span>
                    </button>
                  } @else {
                    <span>{{ col.header }}</span>
                  }
                  @if (col.filterable) {
                    <input
                      class="cf-input dg-col-filter"
                      type="search"
                      [ngModel]="columnFilterDraft[col.key] || ''"
                      (ngModelChange)="onColumnFilterInput(col.key, $event)"
                      [placeholder]="'Filtrar…'"
                      autocomplete="off"
                      spellcheck="false"
                      (click)="$event.stopPropagation()" />
                  }
                </th>
              }
              @if (hasActions) {
                <th class="th-actions">Acciones</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track trackRow(row, $index)) {
              <tr>
                @for (col of columns; track col.key) {
                  <td [class]="cellClass(col)">
                    @switch (col.type) {
                      @case ('code') {
                        <app-copyable-code
                          [value]="asCodeValue(cellValue(row, col))"
                          [label]="col.codeLabel || col.header" />
                      }
                      @case ('status') {
                        <app-status-tag
                          [value]="asStatusValue(cellValue(row, col))"
                          [options]="col.statusOptions || []" />
                      }
                      @case ('date') {
                        <div>{{ asDateValue(cellValue(row, col)) | date: col.dateFormat || 'mediumDate' }}</div>
                        @if (cellSub(row, col); as sub) {
                          <div class="td-sub">{{ sub }}</div>
                        }
                      }
                      @case ('number') {
                        {{ cellValue(row, col) }}
                      }
                      @case ('custom') {
                        @if (cellTemplates[col.key]; as tpl) {
                          <ng-container
                            *ngTemplateOutlet="tpl; context: { $implicit: row, column: col }" />
                        }
                      }
                      @default {
                        @if (cellSub(row, col); as sub) {
                          <div>{{ cellValue(row, col) }}</div>
                          <div class="td-sub">{{ sub }}</div>
                        } @else {
                          {{ cellValue(row, col) }}
                        }
                      }
                    }
                  </td>
                }
                @if (hasActions) {
                  <td class="td-actions">
                    <div class="row-actions">
                      @for (act of buttonActionsFor(row); track act.id) {
                        <button
                          type="button"
                          [class]="actionBtnClass(act)"
                          (click)="emitAction(act.id, row)">
                          <span class="mi">{{ act.icon }}</span>
                          {{ act.label }}
                        </button>
                      }
                      @if (menuActionsFor(row).length) {
                        <div class="cf-menu" [class.open]="openMenuId === menuId(row)">
                          <button
                            type="button"
                            class="cf-icon-btn"
                            aria-label="Más acciones"
                            (click)="toggleMenu(row, $event)">
                            <span class="mi">more_vert</span>
                          </button>
                          <div class="cf-menu-panel">
                            @for (act of menuActionsFor(row); track act.id) {
                              <button
                                type="button"
                                class="cf-menu-item"
                                [class.danger]="act.danger"
                                (click)="emitAction(act.id, row); closeMenus()">
                                <span class="mi">{{ act.icon }}</span>
                                {{ act.label }}
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages > 1) {
        <div class="cf-pagination">
          <span class="cf-pagination-info">
            {{ total }} registro{{ total === 1 ? '' : 's' }} · Página {{ page }} de {{ totalPages }}
          </span>
          <div class="cf-pagination-actions">
            <button
              type="button"
              class="btn-secondary btn-sm"
              [disabled]="page <= 1"
              (click)="goPage(page - 1)">
              <span class="mi">chevron_left</span>
            </button>
            <button
              type="button"
              class="btn-secondary btn-sm"
              [disabled]="page >= totalPages"
              (click)="goPage(page + 1)">
              <span class="mi">chevron_right</span>
            </button>
          </div>
        </div>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dg-sort-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: inherit;
        letter-spacing: inherit;
        text-transform: inherit;
        cursor: pointer;
      }

      .dg-sort-btn:hover {
        color: var(--ink-1, #1a1d23);
      }

      .dg-sort-icon {
        font-size: 1rem;
        opacity: 0.55;
        line-height: 1;
      }

      .dg-col-filter {
        display: block;
        width: 100%;
        margin-top: 6px;
        min-width: 0;
        padding: 4px 8px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: none;
        letter-spacing: normal;
      }

      .cf-pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid var(--line, #e4e7eb);
      }

      .cf-pagination-info {
        font-size: 0.78rem;
        color: var(--ink-3, #8a929c);
      }

      .cf-pagination-actions {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class DataGridComponent<T = unknown> implements OnChanges {
  @Input({ required: true }) columns: DataGridColumn<T>[] = [];
  @Input() rows: T[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 25;
  @Input() sort: ListSort | null = null;
  @Input() columnFilters: Record<string, string> = {};
  @Input() actions: DataGridAction<T>[] = [];
  @Input() trackBy = 'id';
  @Input() emptyTitle = 'Sin registros';
  @Input() emptySubtitle = 'No hay datos que coincidan con los filtros aplicados.';
  @Input() emptyIcon = 'inbox';
  @Input() emptyNavIcon: NavIconName | null = null;
  @Input() cellTemplates: Record<string, TemplateRef<unknown>> = {};

  @Output() readonly queryChange = new EventEmitter<DataGridQueryChange>();
  @Output() readonly action = new EventEmitter<DataGridActionEvent<T>>();

  openMenuId: string | null = null;
  columnFilterDraft: Record<string, string> = {};
  private filterTimers = new Map<string, ReturnType<typeof setTimeout>>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnFilters']) {
      this.columnFilterDraft = { ...(this.columnFilters ?? {}) };
    }
  }

  get hasActions(): boolean {
    return this.actions.length > 0;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / Math.max(1, this.pageSize)));
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId = null;
  }

  trackRow(row: T, index: number): unknown {
    const key = this.trackBy;
    if (row && typeof row === 'object' && key in (row as object)) {
      return (row as Record<string, unknown>)[key];
    }
    return index;
  }

  cellValue(row: T, col: DataGridColumn<T>): unknown {
    if (col.value) return col.value(row);
    if (row && typeof row === 'object') {
      return (row as Record<string, unknown>)[col.key];
    }
    return undefined;
  }

  cellSub(row: T, col: DataGridColumn<T>): string | null {
    const sub = col.sub?.(row);
    return sub ? String(sub) : null;
  }

  asCodeValue(value: unknown): string | number | null | undefined {
    if (value == null) return value as null | undefined;
    if (typeof value === 'string' || typeof value === 'number') return value;
    return String(value);
  }

  asStatusValue(value: unknown): string | boolean | null | undefined {
    if (value == null) return value as null | undefined;
    if (typeof value === 'string' || typeof value === 'boolean') return value;
    return String(value);
  }

  asDateValue(value: unknown): string | number | Date | null | undefined {
    if (value == null) return value as null | undefined;
    if (value instanceof Date || typeof value === 'string' || typeof value === 'number') return value;
    return String(value);
  }

  headerClass(col: DataGridColumn<T>): string {
    const parts = [col.class, col.type === 'number' ? 'num' : ''].filter(Boolean);
    return parts.join(' ');
  }

  cellClass(col: DataGridColumn<T>): string {
    const parts = [
      col.class,
      col.type === 'number' ? 'num' : '',
      col.emphasize && col.type === 'text' ? 'td-name' : '',
    ].filter(Boolean);
    return parts.join(' ');
  }

  sortIcon(key: string): string {
    if (this.sort?.key !== key) return 'unfold_more';
    return this.sort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  toggleSort(key: string): void {
    let next: ListSort | null;
    if (this.sort?.key !== key) {
      next = { key, dir: 'asc' };
    } else if (this.sort.dir === 'asc') {
      next = { key, dir: 'desc' };
    } else {
      next = null;
    }
    this.queryChange.emit({ sort: next, page: 1 });
  }

  onColumnFilterInput(key: string, value: string): void {
    this.columnFilterDraft = { ...this.columnFilterDraft, [key]: value };
    const prev = this.filterTimers.get(key);
    if (prev) clearTimeout(prev);
    this.filterTimers.set(
      key,
      setTimeout(() => {
        const next = { ...(this.columnFilters ?? {}), [key]: value };
        if (!value.trim()) delete next[key];
        this.queryChange.emit({ columnFilters: next, page: 1 });
      }, 250),
    );
  }

  goPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.totalPages);
    if (clamped === this.page) return;
    this.queryChange.emit({ page: clamped });
  }

  buttonActionsFor(row: T): DataGridAction<T>[] {
    return this.actions.filter(a => this.resolvedKind(a) === 'button' && this.isVisible(a, row));
  }

  menuActionsFor(row: T): DataGridAction<T>[] {
    return this.actions.filter(a => this.resolvedKind(a) === 'menu' && this.isVisible(a, row));
  }

  /** Default: `view` stays inline; edit/delete/etc. go in the ⋮ menu. */
  resolvedKind(act: DataGridAction<T>): DataGridActionKind {
    if (act.kind) return act.kind;
    return act.id === 'view' ? 'button' : 'menu';
  }

  actionBtnClass(act: DataGridAction<T>): string {
    const variant = act.variant ?? 'secondary';
    return `btn-${variant} btn-sm`;
  }

  menuId(row: T): string {
    return `dg-${String(this.trackRow(row, 0))}`;
  }

  toggleMenu(row: T, event: Event): void {
    event.stopPropagation();
    const id = this.menuId(row);
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  emitAction(id: string, row: T): void {
    this.action.emit({ id, row });
  }

  private isVisible(act: DataGridAction<T>, row: T): boolean {
    return act.visible ? act.visible(row) : true;
  }
}
