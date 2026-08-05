import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  BusinessFilterOptions,
  BusinessInsightsFilters,
  BusinessKpis,
  ChartPoint,
  DistributionSlice,
  emptyBusinessFilters,
  HeatmapData,
  RankedPoint,
} from '../../core/models/business-insights';
import { BusinessInsightsService } from '../../core/services/business-insights/business-insights.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { KpiCardComponent, KpiCardColor } from '../../shared/kpi-card/kpi-card.component';
import { LineChartComponent } from '../../shared/charts/line-chart/line-chart.component';
import { BarChartComponent } from '../../shared/charts/bar-chart/bar-chart.component';
import { RankedBarListComponent } from '../../shared/charts/ranked-bar-list/ranked-bar-list.component';
import { DonutChartComponent } from '../../shared/charts/donut-chart/donut-chart.component';
import { HeatmapGridComponent } from '../../shared/charts/heatmap-grid/heatmap-grid.component';
import { BusinessFilterBarComponent } from './widgets/business-filter-bar.component';

@Component({
  selector: 'app-business-insights-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EmptyStateComponent,
    KpiCardComponent,
    LineChartComponent,
    BarChartComponent,
    RankedBarListComponent,
    DonutChartComponent,
    HeatmapGridComponent,
    BusinessFilterBarComponent,
  ],
  templateUrl: './business-insights-dashboard.component.html',
  styleUrl: './business-insights-dashboard.component.css',
})
export class BusinessInsightsDashboardComponent implements OnInit {
  options!: BusinessFilterOptions;
  filters: BusinessInsightsFilters = emptyBusinessFilters();

  kpis!: BusinessKpis;
  salesByHour: ChartPoint[] = [];
  salesByDay: ChartPoint[] = [];
  salesByMonth: ChartPoint[] = [];
  topMerchants: RankedPoint[] = [];
  topBranches: RankedPoint[] = [];
  topTerminals: RankedPoint[] = [];
  mccDist: DistributionSlice[] = [];
  cardBrandDist: DistributionSlice[] = [];
  cardTypeDist: DistributionSlice[] = [];
  currencyDist: DistributionSlice[] = [];
  heatmap: HeatmapData | null = null;

  readonly merchantLink = (item: RankedPoint): unknown[] => ['/business-insights/comercio', item.id];
  readonly branchLink = (item: RankedPoint): unknown[] => ['/business-insights/sucursal', item.id];

  constructor(private svc: BusinessInsightsService) {}

  ngOnInit(): void {
    this.options = this.svc.getFilterOptions();
    this.recompute();
  }

  onFiltersChange(filters: BusinessInsightsFilters): void {
    this.filters = filters;
    this.recompute();
  }

  private recompute(): void {
    this.kpis = this.svc.getKpis(this.filters);
    this.salesByHour = this.svc.getSalesByHour(this.filters);
    this.salesByDay = this.svc.getSalesByDay(this.filters);
    this.salesByMonth = this.svc.getSalesByMonth(this.filters);
    this.topMerchants = this.svc.getTopMerchants(this.filters, 10);
    this.topBranches = this.svc.getTopBranches(this.filters, 10);
    this.topTerminals = this.svc.getTopTerminals(this.filters, 10);
    this.mccDist = this.svc.getMccDistribution(this.filters);
    this.cardBrandDist = this.svc.getCardBrandDistribution(this.filters);
    this.cardTypeDist = this.svc.getCardTypeDistribution(this.filters);
    this.currencyDist = this.svc.getCurrencyDistribution(this.filters);
    this.heatmap = this.svc.getHeatmap(this.filters);
  }

  terminalMerchantName(terminalId: string): string {
    return this.svc.getTerminalById(terminalId)?.merchantName ?? '—';
  }

  growthColor(value: number | null): KpiCardColor {
    if (value === null) return 'slate';
    return value >= 0 ? 'green' : 'red';
  }

  readonly formatCurrency = (v: number): string => `L ${Math.round(v).toLocaleString('es-HN')}`;

  readonly formatCurrencyShort = (v: number): string => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `L ${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `L ${(v / 1_000).toFixed(1)}K`;
    return `L ${Math.round(v).toLocaleString('es-HN')}`;
  };

  readonly formatNumber = (v: number): string => v.toLocaleString('es-HN');

  readonly formatPercent = (v: number | null): string => (v === null ? '—' : `${v >= 0 ? '+' : ''}${v}%`);
}
