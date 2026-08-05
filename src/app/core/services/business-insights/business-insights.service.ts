import { Injectable } from '@angular/core';
import {
  BizBranch,
  BizMerchant,
  BizTerminal,
  BizTransaction,
  BusinessFilterOptions,
  BusinessInsightsFilters,
  BusinessKpis,
  CARD_BRAND_LABELS,
  CARD_TYPE_LABELS,
  CardBrand,
  CardType,
  ChartPoint,
  DistributionSlice,
  HeatmapData,
  MCC_CATEGORY_LABELS,
  MccCategory,
  RankedPoint,
  TerminalTrendPoint,
} from '../../models/business-insights';
import { generateBusinessDataset, BusinessDataset } from '../../mock/business-insights/business-data-generator';
import { ACQUIRER_BANKS, CARD_BRAND_WEIGHTS, CARD_TYPE_WEIGHTS } from '../../mock/business-insights/business-reference-data';

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pctChange(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export interface TerminalMetrics {
  terminal: BizTerminal | undefined;
  ventasHoy: number;
  ventasMes: number;
  transaccionesMes: number;
  ultimaVenta: string | null;
  promedioDiario: number;
  tendenciaPercent: number | null;
  historico: TerminalTrendPoint[];
}

/** Analiza el comportamiento comercial de la red POS a partir de un dataset mock generado en memoria. */
@Injectable({ providedIn: 'root' })
export class BusinessInsightsService {
  private readonly dataset: BusinessDataset = generateBusinessDataset();

  private readonly merchantById = new Map<string, BizMerchant>(this.dataset.merchants.map(m => [m.id, m]));
  private readonly branchById = new Map<string, BizBranch>(this.dataset.branches.map(b => [b.id, b]));
  private readonly terminalById = new Map<string, BizTerminal>(this.dataset.terminals.map(t => [t.id, t]));

  private filterOptionsCache?: BusinessFilterOptions;

  get merchants(): BizMerchant[] {
    return this.dataset.merchants;
  }

  get branches(): BizBranch[] {
    return this.dataset.branches;
  }

  get terminals(): BizTerminal[] {
    return this.dataset.terminals;
  }

  get transactionCount(): number {
    return this.dataset.transactions.length;
  }

  getMerchantById(id: string): BizMerchant | undefined {
    return this.merchantById.get(id);
  }

  getBranchById(id: string): BizBranch | undefined {
    return this.branchById.get(id);
  }

  getTerminalById(id: string): BizTerminal | undefined {
    return this.terminalById.get(id);
  }

  getBranchesForMerchant(merchantId: string): BizBranch[] {
    return this.dataset.branches.filter(b => b.merchantId === merchantId);
  }

  getTerminalsForBranch(branchId: string): BizTerminal[] {
    return this.dataset.terminals.filter(t => t.branchId === branchId);
  }

  getTerminalsForMerchant(merchantId: string): BizTerminal[] {
    return this.dataset.terminals.filter(t => t.merchantId === merchantId);
  }

  getFilterOptions(): BusinessFilterOptions {
    if (this.filterOptionsCache) return this.filterOptionsCache;

    this.filterOptionsCache = {
      merchants: [...this.dataset.merchants]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(m => ({ id: m.id, name: m.name })),
      branches: [...this.dataset.branches]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(b => ({ id: b.id, name: b.name, merchantId: b.merchantId })),
      terminals: this.dataset.terminals.map(t => ({ id: t.id, label: `${t.serial} · ${t.branchName}`, branchId: t.branchId })),
      acquirerBanks: [...ACQUIRER_BANKS],
      cardBrands: CARD_BRAND_WEIGHTS.map(w => w.id),
      cardTypes: CARD_TYPE_WEIGHTS.map(w => w.id),
      mccCategories: Object.keys(MCC_CATEGORY_LABELS) as MccCategory[],
      cities: [...new Set(this.dataset.merchants.map(m => m.city))].sort(),
      departments: [...new Set(this.dataset.merchants.map(m => m.department))].sort(),
      currencies: ['HNL', 'USD'],
    };
    return this.filterOptionsCache;
  }

  // ── Filtering helpers ─────────────────────────────────────────────────

  private matchesDimensions(tx: BizTransaction, filters: BusinessInsightsFilters): boolean {
    if (filters.merchantId && tx.merchantId !== filters.merchantId) return false;
    if (filters.branchId && tx.branchId !== filters.branchId) return false;
    if (filters.terminalId && tx.terminalId !== filters.terminalId) return false;
    if (filters.acquirerBank && tx.acquirerBank !== filters.acquirerBank) return false;
    if (filters.cardBrand && tx.cardBrand !== filters.cardBrand) return false;
    if (filters.cardType && tx.cardType !== filters.cardType) return false;
    if (filters.mccCategory && tx.mccCategory !== filters.mccCategory) return false;
    if (filters.city && tx.city !== filters.city) return false;
    if (filters.department && tx.department !== filters.department) return false;
    if (filters.currency && tx.currency !== filters.currency) return false;
    return true;
  }

  private terminalsMatchingDims(filters: BusinessInsightsFilters): BizTerminal[] {
    return this.dataset.terminals.filter(
      t =>
        (!filters.merchantId || t.merchantId === filters.merchantId) &&
        (!filters.branchId || t.branchId === filters.branchId) &&
        (!filters.terminalId || t.id === filters.terminalId) &&
        (!filters.mccCategory || t.mccCategory === filters.mccCategory) &&
        (!filters.city || t.city === filters.city) &&
        (!filters.department || t.department === filters.department),
    );
  }

  /** Resuelve el rango [from, to] real correspondiente al preset de fecha seleccionado. */
  resolveDateRange(filters: BusinessInsightsFilters): { from: Date; to: Date } {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    switch (filters.datePreset) {
      case 'today':
        return { from: todayStart, to: todayEnd };
      case 'yesterday': {
        const from = addDays(todayStart, -1);
        const to = new Date(from);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case 'last7':
        return { from: addDays(todayStart, -6), to: todayEnd };
      case 'last30':
        return { from: addDays(todayStart, -29), to: todayEnd };
      case 'thisMonth':
        return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: todayEnd };
      case 'thisYear':
        return { from: new Date(now.getFullYear(), 0, 1), to: todayEnd };
      case 'custom': {
        const from = filters.dateFrom ? startOfDay(new Date(filters.dateFrom)) : addDays(todayStart, -29);
        const to = filters.dateTo ? new Date(filters.dateTo) : todayEnd;
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      default:
        return { from: addDays(todayStart, -29), to: todayEnd };
    }
  }

  private filterTransactions(filters: BusinessInsightsFilters, withDate: boolean): BizTransaction[] {
    const dims = this.dataset.transactions.filter(tx => this.matchesDimensions(tx, filters));
    if (!withDate) return dims;
    const { from, to } = this.resolveDateRange(filters);
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return dims.filter(tx => {
      const t = new Date(tx.createdAt).getTime();
      return t >= fromTime && t <= toTime;
    });
  }

  // ── KPIs ───────────────────────────────────────────────────────────────

  /** Los KPIs siempre usan ventanas fijas (hoy / mes / año en curso) — solo respetan filtros de dimensión, no el rango de fecha. */
  getKpis(filters: BusinessInsightsFilters): BusinessKpis {
    const dims = this.dataset.transactions.filter(tx => this.matchesDimensions(tx, filters));
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = addDays(todayStart, -1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthCutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() + 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearCutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1);
    const activeSince = addDays(todayStart, -30);

    let volumeToday = 0;
    let volumeYesterday = 0;
    let volumeMonth = 0;
    let volumeLastMonthToDate = 0;
    let volumeYear = 0;
    let volumeLastYearToDate = 0;
    let transactionCount = 0;
    const activeMerchants = new Set<string>();
    const posToday = new Set<string>();

    for (const tx of dims) {
      const t = new Date(tx.createdAt);
      if (t >= todayStart) posToday.add(tx.terminalId);
      if (t >= todayStart && t <= now) volumeToday += tx.amountHnl;
      if (t >= yesterdayStart && t < todayStart) volumeYesterday += tx.amountHnl;
      if (t >= monthStart) {
        volumeMonth += tx.amountHnl;
        transactionCount++;
      }
      if (t >= lastMonthStart && t < lastMonthCutoff) volumeLastMonthToDate += tx.amountHnl;
      if (t >= yearStart) volumeYear += tx.amountHnl;
      if (t >= lastYearStart && t < lastYearCutoff) volumeLastYearToDate += tx.amountHnl;
      if (t >= activeSince) activeMerchants.add(tx.merchantId);
    }

    const scopedTerminals = this.terminalsMatchingDims(filters);
    const posSoldToday = posToday.size;
    const posNoSales = Math.max(0, scopedTerminals.length - posSoldToday);

    return {
      volumeToday: Math.round(volumeToday),
      volumeMonth: Math.round(volumeMonth),
      volumeYear: Math.round(volumeYear),
      transactionCount,
      avgTicket: transactionCount ? Math.round(volumeMonth / transactionCount) : 0,
      activeMerchants: activeMerchants.size,
      posSoldToday,
      posNoSales,
      growthVsYesterday: pctChange(volumeToday, volumeYesterday),
      growthVsLastMonth: pctChange(volumeMonth, volumeLastMonthToDate),
      growthVsLastYear: pctChange(volumeYear, volumeLastYearToDate),
    };
  }

  // ── Series temporales ────────────────────────────────────────────────

  getSalesByHour(filters: BusinessInsightsFilters): ChartPoint[] {
    const txs = this.filterTransactions(filters, true);
    const totals = new Array(24).fill(0);
    for (const tx of txs) totals[new Date(tx.createdAt).getHours()] += tx.amountHnl;
    return totals.map((v, h) => ({ label: `${String(h).padStart(2, '0')}:00`, value: Math.round(v) }));
  }

  getSalesByDay(filters: BusinessInsightsFilters): ChartPoint[] {
    const { from, to } = this.resolveDateRange(filters);
    const txs = this.filterTransactions(filters, true);
    const map = new Map<string, number>();
    const cursor = new Date(from);
    while (cursor <= to) {
      map.set(dateKey(cursor), 0);
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const tx of txs) {
      const key = dateKey(new Date(tx.createdAt));
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + tx.amountHnl);
    }
    return [...map.entries()].map(([key, value]) => ({
      label: new Date(`${key}T00:00:00`).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' }),
      value: Math.round(value),
    }));
  }

  /** Ignora el filtro de fecha — siempre muestra los últimos 12 meses (solo aplica filtros de dimensión). */
  getSalesByMonth(filters: BusinessInsightsFilters): ChartPoint[] {
    const dims = this.dataset.transactions.filter(tx => this.matchesDimensions(tx, filters));
    const now = new Date();
    const buckets: { key: string; label: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('es-HN', { month: 'short', year: '2-digit' }),
        value: 0,
      });
    }
    const byKey = new Map(buckets.map(b => [b.key, b]));
    for (const tx of dims) {
      const d = new Date(tx.createdAt);
      const bucket = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.value += tx.amountHnl;
    }
    return buckets.map(b => ({ label: b.label, value: Math.round(b.value) }));
  }

  // ── Rankings ─────────────────────────────────────────────────────────

  getTopMerchants(filters: BusinessInsightsFilters, n = 10): RankedPoint[] {
    const txs = this.filterTransactions(filters, true);
    const map = new Map<string, { value: number; count: number }>();
    for (const tx of txs) {
      const e = map.get(tx.merchantId) ?? { value: 0, count: 0 };
      e.value += tx.amountHnl;
      e.count++;
      map.set(tx.merchantId, e);
    }
    return [...map.entries()]
      .map(([id, e]) => ({ id, label: this.merchantById.get(id)?.name ?? id, value: Math.round(e.value), secondaryValue: e.count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  }

  getTopBranches(filters: BusinessInsightsFilters, n = 10): RankedPoint[] {
    const txs = this.filterTransactions(filters, true);
    const map = new Map<string, { value: number; count: number }>();
    for (const tx of txs) {
      const e = map.get(tx.branchId) ?? { value: 0, count: 0 };
      e.value += tx.amountHnl;
      e.count++;
      map.set(tx.branchId, e);
    }
    return [...map.entries()]
      .map(([id, e]) => ({ id, label: this.branchById.get(id)?.name ?? id, value: Math.round(e.value), secondaryValue: e.count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  }

  getTopTerminals(filters: BusinessInsightsFilters, n = 10): RankedPoint[] {
    const txs = this.filterTransactions(filters, true);
    const map = new Map<string, { value: number; count: number }>();
    for (const tx of txs) {
      const e = map.get(tx.terminalId) ?? { value: 0, count: 0 };
      e.value += tx.amountHnl;
      e.count++;
      map.set(tx.terminalId, e);
    }
    return [...map.entries()]
      .map(([id, e]) => {
        const terminal = this.terminalById.get(id);
        return {
          id,
          label: terminal ? `${terminal.serial} · ${terminal.branchName}` : id,
          value: Math.round(e.value),
          secondaryValue: e.count,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  }

  // ── Distribuciones ───────────────────────────────────────────────────

  private buildDistribution<K extends string>(
    txs: BizTransaction[],
    keyFn: (tx: BizTransaction) => K,
    labelOf: (key: K) => string,
  ): DistributionSlice[] {
    const totals = new Map<K, number>();
    let grand = 0;
    for (const tx of txs) {
      const key = keyFn(tx);
      totals.set(key, (totals.get(key) ?? 0) + tx.amountHnl);
      grand += tx.amountHnl;
    }
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, value], i) => ({
        key,
        label: labelOf(key),
        value: Math.round(value),
        percent: grand ? Math.round((value / grand) * 1000) / 10 : 0,
        colorIndex: i,
      }));
  }

  getMccDistribution(filters: BusinessInsightsFilters): DistributionSlice[] {
    const txs = this.filterTransactions(filters, true);
    return this.buildDistribution(txs, tx => tx.mccCategory, key => MCC_CATEGORY_LABELS[key as MccCategory]);
  }

  getCardBrandDistribution(filters: BusinessInsightsFilters): DistributionSlice[] {
    const txs = this.filterTransactions(filters, true);
    return this.buildDistribution(txs, tx => tx.cardBrand, key => CARD_BRAND_LABELS[key as CardBrand]);
  }

  getCardTypeDistribution(filters: BusinessInsightsFilters): DistributionSlice[] {
    const txs = this.filterTransactions(filters, true);
    return this.buildDistribution(txs, tx => tx.cardType, key => CARD_TYPE_LABELS[key as CardType]);
  }

  getCurrencyDistribution(filters: BusinessInsightsFilters): DistributionSlice[] {
    const txs = this.filterTransactions(filters, true);
    return this.buildDistribution(txs, tx => tx.currency, key => key);
  }

  // ── Heatmap ──────────────────────────────────────────────────────────

  getHeatmap(filters: BusinessInsightsFilters): HeatmapData {
    const txs = this.filterTransactions(filters, true);
    const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
    for (const tx of txs) {
      const d = new Date(tx.createdAt);
      grid[d.getDay()][d.getHours()] += tx.amountHnl;
    }
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hourLabels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}h`);
    const cells: { dayIndex: number; hour: number; value: number }[] = [];
    let maxValue = 0;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const value = Math.round(grid[d][h]);
        cells.push({ dayIndex: d, hour: h, value });
        if (value > maxValue) maxValue = value;
      }
    }
    return { dayLabels, hourLabels, cells, maxValue };
  }

  // ── Drill-down: terminal ────────────────────────────────────────────

  getTerminalMetrics(terminalId: string): TerminalMetrics {
    const terminal = this.terminalById.get(terminalId);
    const txs = this.dataset.transactions
      .filter(tx => tx.terminalId === terminalId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last30Start = addDays(todayStart, -29);

    let ventasHoy = 0;
    let ventasMes = 0;
    let transaccionesMes = 0;
    const dailyTotals = new Map<string, number>();

    for (const tx of txs) {
      const d = new Date(tx.createdAt);
      if (d >= todayStart) ventasHoy += tx.amountHnl;
      if (d >= monthStart) {
        ventasMes += tx.amountHnl;
        transaccionesMes++;
      }
      if (d >= last30Start) {
        const key = dateKey(d);
        dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + tx.amountHnl);
      }
    }

    const historico: TerminalTrendPoint[] = [];
    const cursor = new Date(last30Start);
    while (cursor <= now) {
      const key = dateKey(cursor);
      historico.push({ date: key, value: Math.round(dailyTotals.get(key) ?? 0) });
      cursor.setDate(cursor.getDate() + 1);
    }

    const last7 = historico.slice(-7).map(p => p.value);
    const prev7 = historico.slice(-14, -7).map(p => p.value);
    const promedioDiario = historico.length ? Math.round(avg(historico.map(p => p.value))) : 0;

    return {
      terminal,
      ventasHoy: Math.round(ventasHoy),
      ventasMes: Math.round(ventasMes),
      transaccionesMes,
      ultimaVenta: txs.length ? txs[txs.length - 1].createdAt : null,
      promedioDiario,
      tendenciaPercent: pctChange(avg(last7), avg(prev7)),
      historico,
    };
  }

  // ── Detalle de transacciones ─────────────────────────────────────────

  queryTransactions(
    filters: BusinessInsightsFilters,
    page = 1,
    pageSize = 25,
  ): { rows: BizTransaction[]; total: number } {
    const txs = this.filterTransactions(filters, true).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = txs.length;
    const start = (page - 1) * pageSize;
    return { rows: txs.slice(start, start + pageSize), total };
  }
}
