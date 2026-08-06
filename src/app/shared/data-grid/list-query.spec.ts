import { applyListQuery, createListQuery } from './list-query';

describe('applyListQuery', () => {
  const rows = [
    { id: '1', brand: 'PAX', model: 'A920', status: 'active' },
    { id: '2', brand: 'Sunmi', model: 'V2', status: 'obsolete' },
    { id: '3', brand: 'PAX', model: 'A80', status: 'active' },
    { id: '4', brand: 'Urovo', model: 'DT40', status: 'discontinued' },
  ];

  it('filters with matchFilters (panel q)', () => {
    const query = createListQuery({ filters: { q: 'pax' }, pageSize: 25 });
    const result = applyListQuery(rows, query, {
      matchFilters: (item, filters) => {
        const q = String(filters['q'] ?? '')
          .toLowerCase()
          .trim();
        return !q || item.brand.toLowerCase().includes(q);
      },
    });
    expect(result.total).toBe(2);
    expect(result.items.map(r => r.id)).toEqual(['1', '3']);
  });

  it('applies columnFilters, sort and pagination', () => {
    const query = createListQuery({
      columnFilters: { brand: 'pa' },
      sort: { key: 'model', dir: 'asc' },
      page: 1,
      pageSize: 1,
    });
    const result = applyListQuery(rows, query);
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].model).toBe('A80');
  });

  it('sorts descending and pages to last slice', () => {
    const query = createListQuery({
      sort: { key: 'brand', dir: 'desc' },
      page: 2,
      pageSize: 2,
    });
    const result = applyListQuery(rows, query);
    expect(result.total).toBe(4);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].brand).toBe('PAX');
  });
});
