import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { TransactionLimit } from '../../../../core/models/pos-admin';
import { LimitCatalogService } from '../../../../core/services/pos-admin/limit-catalog.service';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { DataGridComponent } from '../../../../shared/data-grid/data-grid.component';
import {
  DataGridAction,
  DataGridActionEvent,
  DataGridColumn,
  DataGridQueryChange,
} from '../../../../shared/data-grid/data-grid.types';
import {
  applyListQuery,
  createListQuery,
  ListQuery,
  ListResult,
} from '../../../../shared/data-grid/list-query';
import { STATUS_TAG_ACTIVE_INACTIVE } from '../../../../shared/status-tag/status-tag.component';
import { LimitDialogComponent } from '../dialogs/limit-dialog.component';

/** Panel de catálogo de límites (pestaña dentro de Comercios / MCC). */
@Component({
  selector: 'app-limit-catalog-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataGridComponent],
  providers: [CurrencyPipe],
  template: `
    <div class="panel toolbar-panel">
      <div class="toolbar">
        <label class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            [formControl]="search"
            placeholder="Buscar código o nombre…"
            autocomplete="off"
            spellcheck="false" />
        </label>
        <button
          type="button"
          [class]="!!search.value ? 'btn-primary' : 'btn-secondary'"
          (click)="search.setValue('')">
          <span class="mi">filter_alt_off</span>
          Limpiar
        </button>
      </div>
    </div>

    <div class="panel">
      <app-data-grid
        [columns]="columns"
        [rows]="result.items"
        [total]="result.total"
        [page]="query.page"
        [pageSize]="query.pageSize"
        [sort]="query.sort ?? null"
        [columnFilters]="query.columnFilters ?? {}"
        [actions]="actions"
        emptyIcon="tune"
        emptyTitle="Sin límites"
        emptySubtitle="No hay límites que coincidan con la búsqueda."
        (queryChange)="onQueryChange($event)"
        (action)="onAction($event)" />
    </div>
  `,
})
export class LimitCatalogPanelComponent implements OnInit {
  private limitSvc = inject(LimitCatalogService);
  private dialog = inject(MatDialog);
  private currency = inject(CurrencyPipe);

  search = new FormControl('');
  all: TransactionLimit[] = [];
  query: ListQuery = createListQuery({ pageSize: 25 });
  result: ListResult<TransactionLimit> = { items: [], total: 0 };

  readonly columns: DataGridColumn<TransactionLimit>[] = [
    { key: 'code', header: 'Código', type: 'code', sortable: true, filterable: true, codeLabel: 'límite' },
    { key: 'name', header: 'Nombre', type: 'text', sortable: true, emphasize: true, class: 'td-name' },
    {
      key: 'maxAmount',
      header: 'Monto máx.',
      type: 'text',
      sortable: true,
      class: 'num',
      value: row =>
        row.maxAmount != null
          ? this.currency.transform(row.maxAmount, 'HNL', 'symbol-narrow', '1.0-0') ?? String(row.maxAmount)
          : '—',
    },
    {
      key: 'description',
      header: 'Descripción',
      type: 'text',
      value: row => row.description || '—',
    },
    { key: 'status', header: 'Estado', type: 'status', statusOptions: STATUS_TAG_ACTIVE_INACTIVE },
  ];

  readonly actions: DataGridAction<TransactionLimit>[] = [
    { id: 'edit', label: 'Editar', icon: 'edit' },
    { id: 'delete', label: 'Eliminar', icon: 'delete_outline', danger: true },
  ];

  ngOnInit(): void {
    this.limitSvc.limits$.subscribe(items => {
      this.all = items;
      this.refresh();
    });
    this.search.valueChanges.subscribe(() => {
      this.query = {
        ...this.query,
        filters: { ...this.query.filters, q: this.search.value ?? '' },
        page: 1,
      };
      this.refresh();
    });
  }

  openCreate(): void {
    this.openDialog();
  }

  onQueryChange(change: DataGridQueryChange): void {
    this.query = {
      ...this.query,
      columnFilters: change.columnFilters ?? this.query.columnFilters,
      sort: change.sort !== undefined ? change.sort : this.query.sort,
      page: change.page ?? this.query.page,
      pageSize: change.pageSize ?? this.query.pageSize,
    };
    this.refresh();
  }

  onAction(event: DataGridActionEvent<TransactionLimit>): void {
    if (event.id === 'edit') this.openDialog(event.row);
    if (event.id === 'delete') this.confirmDelete(event.row);
  }

  private openDialog(item?: TransactionLimit): void {
    this.dialog.open(LimitDialogComponent, {
      width: '480px',
      maxWidth: '94vw',
      panelClass: 'cf-dialog-panel',
      data: item ? { item } : {},
    });
  }

  private confirmDelete(item: TransactionLimit): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        panelClass: 'cf-dialog-panel',
        data: {
          title: 'Confirmar eliminación',
          message: `¿Eliminar límite ${item.code} · ${item.name}?`,
          danger: true,
          confirmLabel: 'Eliminar',
        },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) this.limitSvc.delete(item.id);
      });
  }

  private refresh(): void {
    const q = String(this.query.filters['q'] ?? this.search.value ?? '');
    this.query = { ...this.query, filters: { ...this.query.filters, q } };
    const options = {
      matchFilters: (item: TransactionLimit, filters: Record<string, unknown>) => {
        const term = String(filters['q'] ?? '')
          .toLowerCase()
          .trim();
        if (!term) return true;
        return (
          item.code.toLowerCase().includes(term) ||
          item.name.toLowerCase().includes(term) ||
          (item.description ?? '').toLowerCase().includes(term)
        );
      },
    };
    this.result = applyListQuery(this.all, this.query, options);
    const totalPages = Math.max(1, Math.ceil(this.result.total / Math.max(1, this.query.pageSize)));
    if (this.query.page > totalPages) {
      this.query = { ...this.query, page: totalPages };
      this.result = applyListQuery(this.all, this.query, options);
    }
  }
}
