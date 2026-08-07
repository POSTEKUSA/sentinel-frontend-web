import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { MccCode } from '../../../../core/models/pos-admin';
import { MccCatalogService } from '../../../../core/services/pos-admin/mcc-catalog.service';
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
import { MccDialogComponent } from '../dialogs/mcc-dialog.component';

/** Panel de catálogo MCC (pestaña dentro de Comercios / MCC). */
@Component({
  selector: 'app-mcc-catalog-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataGridComponent],
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
            placeholder="Buscar código o descripción…"
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
        emptyIcon="qr_code_2"
        emptyTitle="Sin códigos MCC"
        emptySubtitle="No hay MCC que coincidan con la búsqueda."
        (queryChange)="onQueryChange($event)"
        (action)="onAction($event)" />
    </div>
  `,
})
export class MccCatalogPanelComponent implements OnInit {
  private mccSvc = inject(MccCatalogService);
  private dialog = inject(MatDialog);

  search = new FormControl('');
  all: MccCode[] = [];
  query: ListQuery = createListQuery({ pageSize: 25 });
  result: ListResult<MccCode> = { items: [], total: 0 };

  readonly columns: DataGridColumn<MccCode>[] = [
    { key: 'code', header: 'Código', type: 'code', sortable: true, filterable: true, codeLabel: 'MCC' },
    { key: 'description', header: 'Descripción', type: 'text', sortable: true, emphasize: true, class: 'td-name' },
    { key: 'status', header: 'Estado', type: 'status', statusOptions: STATUS_TAG_ACTIVE_INACTIVE },
  ];

  readonly actions: DataGridAction<MccCode>[] = [
    { id: 'edit', label: 'Editar', icon: 'edit' },
    { id: 'delete', label: 'Eliminar', icon: 'delete_outline', danger: true },
  ];

  ngOnInit(): void {
    this.mccSvc.mcc$.subscribe(items => {
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

  onAction(event: DataGridActionEvent<MccCode>): void {
    if (event.id === 'edit') this.openDialog(event.row);
    if (event.id === 'delete') this.confirmDelete(event.row);
  }

  private openDialog(item?: MccCode): void {
    this.dialog.open(MccDialogComponent, {
      width: '480px',
      maxWidth: '94vw',
      panelClass: 'cf-dialog-panel',
      data: item ? { item } : {},
    });
  }

  private confirmDelete(item: MccCode): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        panelClass: 'cf-dialog-panel',
        data: {
          title: 'Confirmar eliminación',
          message: `¿Eliminar MCC ${item.code} · ${item.description}?`,
          danger: true,
          confirmLabel: 'Eliminar',
        },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) this.mccSvc.delete(item.id);
      });
  }

  private refresh(): void {
    const q = String(this.query.filters['q'] ?? this.search.value ?? '');
    this.query = { ...this.query, filters: { ...this.query.filters, q } };
    const options = {
      matchFilters: (item: MccCode, filters: Record<string, unknown>) => {
        const term = String(filters['q'] ?? '')
          .toLowerCase()
          .trim();
        if (!term) return true;
        return item.code.includes(term) || item.description.toLowerCase().includes(term);
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
