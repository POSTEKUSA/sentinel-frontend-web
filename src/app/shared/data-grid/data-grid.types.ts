import { StatusTagOption } from '../status-tag/status-tag.component';
import { ListSort } from './list-query';

export type DataGridColumnType = 'text' | 'code' | 'status' | 'date' | 'number' | 'custom';

export interface DataGridColumn<T = unknown> {
  key: string;
  header: string;
  type: DataGridColumnType;
  sortable?: boolean;
  filterable?: boolean;
  /** Extra CSS class on th/td (e.g. `num`, `td-name`). */
  class?: string;
  /** Date pipe format when type === 'date'. */
  dateFormat?: string;
  /** Status options when type === 'status'. */
  statusOptions?: StatusTagOption[];
  /** Override cell primary value. */
  value?: (row: T) => unknown;
  /** Secondary line under primary (td-sub). */
  sub?: (row: T) => string | null | undefined;
  /** Use td-name styling on primary text. */
  emphasize?: boolean;
  /** Copyable-code label. */
  codeLabel?: string;
}

export type DataGridActionKind = 'button' | 'menu';

export interface DataGridAction<T = unknown> {
  id: string;
  label: string;
  icon: string;
  kind?: DataGridActionKind;
  /** Visual style for button actions. */
  variant?: 'primary' | 'secondary' | 'ghost';
  danger?: boolean;
  visible?: (row: T) => boolean;
}

export interface DataGridQueryChange {
  page?: number;
  pageSize?: number;
  sort?: ListSort | null;
  columnFilters?: Record<string, string>;
}

export interface DataGridActionEvent<T = unknown> {
  id: string;
  row: T;
}
