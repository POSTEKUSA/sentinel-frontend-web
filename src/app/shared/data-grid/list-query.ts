/** Sort state for list queries (client mock or future HTTP). */
export interface ListSort {
  key: string;
  dir: 'asc' | 'desc';
}

/**
 * Hybrid list query: panel filters → server/mock; sort/page/columnFilters travel together.
 * When an API exists, send this shape as query params / body.
 */
export interface ListQuery {
  /** Panel-level filters (search, selects, etc.). */
  filters: Record<string, unknown>;
  /** Per-column text filters from the grid header. */
  columnFilters?: Record<string, string>;
  sort?: ListSort | null;
  page: number;
  pageSize: number;
}

export interface ListResult<T> {
  items: T[];
  total: number;
}

export interface ApplyListQueryOptions<T> {
  /**
   * Matcher for panel `filters`. If omitted, panel filters are ignored
   * (only columnFilters / sort / page apply).
   */
  matchFilters?: (item: T, filters: Record<string, unknown>) => boolean;
  /** Value accessor for sort + columnFilters. Default: `(item as any)[key]`. */
  getValue?: (item: T, key: string) => unknown;
}

export function createListQuery(partial?: Partial<ListQuery>): ListQuery {
  return {
    sort: partial?.sort ?? null,
    page: partial?.page ?? 1,
    pageSize: partial?.pageSize ?? 25,
    filters: { ...(partial?.filters ?? {}) },
    columnFilters: { ...(partial?.columnFilters ?? {}) },
  };
}

/**
 * Client-side apply of ListQuery for mocks. Swap for HTTP later with the same contract.
 */
export function applyListQuery<T>(
  items: readonly T[],
  query: ListQuery,
  options: ApplyListQueryOptions<T> = {},
): ListResult<T> {
  const getValue =
    options.getValue ??
    ((item: T, key: string) => (item as Record<string, unknown>)[key]);

  let result = items.slice();

  if (options.matchFilters && query.filters && Object.keys(query.filters).length > 0) {
    result = result.filter(item => options.matchFilters!(item, query.filters));
  }

  const colFilters = query.columnFilters ?? {};
  for (const [key, raw] of Object.entries(colFilters)) {
    const q = String(raw ?? '')
      .toLowerCase()
      .trim();
    if (!q) continue;
    result = result.filter(item => {
      const v = getValue(item, key);
      return v != null && String(v).toLowerCase().includes(q);
    });
  }

  if (query.sort?.key) {
    const { key, dir } = query.sort;
    const mul = dir === 'desc' ? -1 : 1;
    result.sort((a, b) => {
      const av = getValue(a, key);
      const bv = getValue(b, key);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mul;
      return String(av).localeCompare(String(bv), undefined, { sensitivity: 'base', numeric: true }) * mul;
    });
  }

  const total = result.length;
  const pageSize = Math.max(1, query.pageSize || 25);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page || 1), totalPages);
  const start = (page - 1) * pageSize;

  return { items: result.slice(start, start + pageSize), total };
}
