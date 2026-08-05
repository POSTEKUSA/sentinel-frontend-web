import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import {
  BizBranch,
  BizMerchant,
  BizTerminal,
  BusinessKpis,
  ChartPoint,
  emptyBusinessFilters,
  MCC_CATEGORY_LABELS,
} from '../../../core/models/business-insights';
import { BusinessInsightsService } from '../../../core/services/business-insights/business-insights.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { KpiCardComponent } from '../../../shared/kpi-card/kpi-card.component';
import { LineChartComponent } from '../../../shared/charts/line-chart/line-chart.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';

@Component({
  selector: 'app-business-branch-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent, KpiCardComponent, LineChartComponent, StatusBadgeComponent],
  templateUrl: './business-branch-detail.component.html',
  styleUrl: './business-branch-detail.component.css',
})
export class BusinessBranchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(BusinessInsightsService);

  readonly mccLabels = MCC_CATEGORY_LABELS;

  branch: BizBranch | undefined;
  merchant: BizMerchant | undefined;
  terminals: BizTerminal[] = [];
  kpis?: BusinessKpis;
  salesByDay: ChartPoint[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.branch = this.svc.getBranchById(id);
    if (!this.branch) return;

    this.merchant = this.svc.getMerchantById(this.branch.merchantId);
    this.terminals = this.svc.getTerminalsForBranch(id);

    const filters = { ...emptyBusinessFilters(), branchId: id, datePreset: 'last30' as const };
    this.kpis = this.svc.getKpis(filters);
    this.salesByDay = this.svc.getSalesByDay(filters);
  }

  get onlineTerminals(): number {
    return this.terminals.filter(t => t.status === 'online').length;
  }

  readonly formatCurrency = (v: number): string => `L ${Math.round(v).toLocaleString('es-HN')}`;

  readonly formatCurrencyShort = (v: number): string => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `L ${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `L ${(v / 1_000).toFixed(1)}K`;
    return `L ${Math.round(v).toLocaleString('es-HN')}`;
  };

  readonly formatNumber = (v: number): string => v.toLocaleString('es-HN');

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
