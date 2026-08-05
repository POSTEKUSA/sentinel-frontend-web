import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import * as L from 'leaflet';

import {
  BizBranch,
  BizMerchant,
  BizTerminal,
  BusinessKpis,
  ChartPoint,
  DistributionSlice,
  emptyBusinessFilters,
  MCC_CATEGORY_LABELS,
  RankedPoint,
} from '../../../core/models/business-insights';
import { BusinessInsightsService } from '../../../core/services/business-insights/business-insights.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { KpiCardComponent } from '../../../shared/kpi-card/kpi-card.component';
import { BarChartComponent } from '../../../shared/charts/bar-chart/bar-chart.component';
import { LineChartComponent } from '../../../shared/charts/line-chart/line-chart.component';
import { RankedBarListComponent } from '../../../shared/charts/ranked-bar-list/ranked-bar-list.component';
import { DonutChartComponent } from '../../../shared/charts/donut-chart/donut-chart.component';

function createBranchMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:#0a5fa5;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

@Component({
  selector: 'app-business-merchant-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EmptyStateComponent,
    KpiCardComponent,
    BarChartComponent,
    LineChartComponent,
    RankedBarListComponent,
    DonutChartComponent,
  ],
  templateUrl: './business-merchant-detail.component.html',
  styleUrl: './business-merchant-detail.component.css',
})
export class BusinessMerchantDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl?: ElementRef<HTMLDivElement>;
  private map?: L.Map;

  private route = inject(ActivatedRoute);
  private svc = inject(BusinessInsightsService);

  readonly mccLabels = MCC_CATEGORY_LABELS;

  merchant: BizMerchant | undefined;
  branches: BizBranch[] = [];
  terminals: BizTerminal[] = [];
  kpis?: BusinessKpis;
  topBranches: RankedPoint[] = [];
  monthly: ChartPoint[] = [];
  cardBrandDist: DistributionSlice[] = [];
  cardTypeDist: DistributionSlice[] = [];
  salesByHour: ChartPoint[] = [];

  readonly branchLink = (item: RankedPoint): unknown[] => ['/business-insights/sucursal', item.id];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.merchant = this.svc.getMerchantById(id);
    if (!this.merchant) return;

    this.branches = this.svc.getBranchesForMerchant(id);
    this.terminals = this.svc.getTerminalsForMerchant(id);

    const filters = { ...emptyBusinessFilters(), merchantId: id };
    this.kpis = this.svc.getKpis(filters);
    this.topBranches = this.svc.getTopBranches(filters, 10);
    this.monthly = this.svc.getSalesByMonth(filters);
    this.cardBrandDist = this.svc.getCardBrandDistribution(filters);
    this.cardTypeDist = this.svc.getCardTypeDistribution(filters);
    this.salesByHour = this.svc.getSalesByHour(filters);
  }

  ngAfterViewInit(): void {
    if (!this.merchant) return;
    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  get onlineTerminals(): number {
    return this.terminals.filter(t => t.status === 'online').length;
  }

  private initMap(): void {
    if (!this.mapEl || !this.branches.length) return;
    this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, scrollWheelZoom: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(this.map);

    const bounds: L.LatLng[] = [];
    this.branches.forEach(b => {
      const latlng = L.latLng(b.latitude, b.longitude);
      bounds.push(latlng);
      L.marker(latlng, { icon: createBranchMarkerIcon() })
        .bindPopup(
          `<div style="min-width:160px;font-family:inherit;">
            <div style="font-weight:600;margin-bottom:4px;">${b.name}</div>
            <div style="font-size:12px;color:#555;margin-bottom:2px;">${b.municipality}, ${b.department}</div>
            <div style="font-size:12px;">${b.terminalCount} terminal(es) POS</div>
          </div>`,
        )
        .addTo(this.map!);
    });

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 14);
    } else {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] });
    }

    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  readonly formatCurrency = (v: number): string => `L ${Math.round(v).toLocaleString('es-HN')}`;

  readonly formatCurrencyShort = (v: number): string => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `L ${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `L ${(v / 1_000).toFixed(1)}K`;
    return `L ${Math.round(v).toLocaleString('es-HN')}`;
  };

  readonly formatNumber = (v: number): string => v.toLocaleString('es-HN');
}
