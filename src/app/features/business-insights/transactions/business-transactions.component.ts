import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import {
  BizCurrency,
  BizTransaction,
  BusinessFilterOptions,
  BusinessInsightsFilters,
  CARD_BRAND_LABELS,
  CARD_TYPE_LABELS,
  CardBrand,
  CardType,
  DateRangePreset,
  emptyBusinessFilters,
  MCC_CATEGORY_LABELS,
  MccCategory,
} from '../../../core/models/business-insights';
import { BusinessInsightsService } from '../../../core/services/business-insights/business-insights.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { BusinessFilterBarComponent } from '../widgets/business-filter-bar.component';

@Component({
  selector: 'app-business-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent, BusinessFilterBarComponent],
  templateUrl: './business-transactions.component.html',
  styleUrl: './business-transactions.component.css',
})
export class BusinessTransactionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(BusinessInsightsService);

  readonly mccLabels = MCC_CATEGORY_LABELS;
  readonly cardBrandLabels = CARD_BRAND_LABELS;
  readonly cardTypeLabels = CARD_TYPE_LABELS;

  options!: BusinessFilterOptions;
  filters: BusinessInsightsFilters = emptyBusinessFilters();
  rows: BizTransaction[] = [];
  total = 0;
  page = 1;
  readonly pageSize = 25;

  ngOnInit(): void {
    this.options = this.svc.getFilterOptions();
    const qp = this.route.snapshot.queryParamMap;
    const hasQueryFilters = qp.keys.length > 0;
    this.filters = hasQueryFilters
      ? {
          datePreset: (qp.get('datePreset') as DateRangePreset) || 'last30',
          dateFrom: qp.get('dateFrom'),
          dateTo: qp.get('dateTo'),
          merchantId: qp.get('merchantId'),
          branchId: qp.get('branchId'),
          terminalId: qp.get('terminalId'),
          acquirerBank: qp.get('acquirerBank'),
          cardBrand: qp.get('cardBrand') as CardBrand | null,
          cardType: qp.get('cardType') as CardType | null,
          mccCategory: qp.get('mccCategory') as MccCategory | null,
          city: qp.get('city'),
          department: qp.get('department'),
          currency: qp.get('currency') as BizCurrency | null,
        }
      : emptyBusinessFilters();
    this.reload();
  }

  onFiltersChange(filters: BusinessInsightsFilters): void {
    this.filters = filters;
    this.page = 1;
    this.reload();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.reload();
  }

  private reload(): void {
    const result = this.svc.queryTransactions(this.filters, this.page, this.pageSize);
    this.rows = result.rows;
    this.total = result.total;
  }

  readonly formatCurrency = (v: number): string => `L ${Math.round(v).toLocaleString('es-HN')}`;

  formatAmount(tx: BizTransaction): string {
    const symbol = tx.currency === 'USD' ? '$' : 'L';
    return `${symbol} ${tx.amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('es-HN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
