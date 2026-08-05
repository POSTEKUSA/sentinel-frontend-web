import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { BizBranch, BizMerchant, ChartPoint, MCC_CATEGORY_LABELS } from '../../../core/models/business-insights';
import { BusinessInsightsService, TerminalMetrics } from '../../../core/services/business-insights/business-insights.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { KpiCardComponent, KpiCardColor } from '../../../shared/kpi-card/kpi-card.component';
import { LineChartComponent } from '../../../shared/charts/line-chart/line-chart.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';

@Component({
  selector: 'app-business-terminal-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent, KpiCardComponent, LineChartComponent, StatusBadgeComponent],
  templateUrl: './business-terminal-detail.component.html',
  styleUrl: './business-terminal-detail.component.css',
})
export class BusinessTerminalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(BusinessInsightsService);

  readonly mccLabels = MCC_CATEGORY_LABELS;

  branch: BizBranch | undefined;
  merchant: BizMerchant | undefined;
  metrics: TerminalMetrics | undefined;
  historicoPoints: ChartPoint[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const terminal = this.svc.getTerminalById(id);
    if (!terminal) return;

    this.metrics = this.svc.getTerminalMetrics(id);
    this.branch = this.svc.getBranchById(terminal.branchId);
    this.merchant = this.svc.getMerchantById(terminal.merchantId);
    this.historicoPoints = this.metrics.historico.map(p => ({
      label: new Date(`${p.date}T00:00:00`).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' }),
      value: p.value,
    }));
  }

  get terminal() {
    return this.metrics?.terminal;
  }

  get trendColor(): KpiCardColor {
    const t = this.metrics?.tendenciaPercent;
    if (t === null || t === undefined) return 'slate';
    return t >= 0 ? 'green' : 'red';
  }

  readonly formatCurrency = (v: number): string => `L ${Math.round(v).toLocaleString('es-HN')}`;

  readonly formatCurrencyShort = (v: number): string => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `L ${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `L ${(v / 1_000).toFixed(1)}K`;
    return `L ${Math.round(v).toLocaleString('es-HN')}`;
  };

  readonly formatNumber = (v: number): string => v.toLocaleString('es-HN');

  formatPercent(v: number | null | undefined): string {
    return v === null || v === undefined ? '—' : `${v >= 0 ? '+' : ''}${v}%`;
  }

  formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-HN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
