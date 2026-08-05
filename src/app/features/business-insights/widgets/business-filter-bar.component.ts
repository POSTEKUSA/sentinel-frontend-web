import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  BizCurrency,
  BusinessFilterOptions,
  BusinessInsightsFilters,
  CARD_BRAND_LABELS,
  CARD_TYPE_LABELS,
  CardBrand,
  CardType,
  DATE_RANGE_PRESET_LABELS,
  DateRangePreset,
  emptyBusinessFilters,
  MCC_CATEGORY_LABELS,
  MccCategory,
} from '../../../core/models/business-insights';

/** Barra de filtros reutilizable — dashboard, comercio y transacciones comparten esta misma UI. */
@Component({
  selector: 'app-business-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-filter-bar.component.html',
  styleUrl: './business-filter-bar.component.css',
})
export class BusinessFilterBarComponent implements OnInit, OnChanges {
  @Input({ required: true }) options!: BusinessFilterOptions;
  @Input() filters: BusinessInsightsFilters = emptyBusinessFilters();
  @Input() showMerchant = true;
  @Input() showBranch = true;
  @Input() showTerminal = true;
  @Output() filtersChange = new EventEmitter<BusinessInsightsFilters>();

  private fb = inject(FormBuilder);

  readonly datePresets: DateRangePreset[] = ['today', 'yesterday', 'last7', 'last30', 'thisMonth', 'thisYear', 'custom'];
  readonly presetLabels = DATE_RANGE_PRESET_LABELS;
  readonly mccLabels = MCC_CATEGORY_LABELS;
  readonly cardBrandLabels = CARD_BRAND_LABELS;
  readonly cardTypeLabels = CARD_TYPE_LABELS;

  filteredBranches: { id: string; name: string; merchantId: string }[] = [];
  filteredTerminals: { id: string; label: string; branchId: string }[] = [];

  private suppressEmit = false;

  form = this.fb.group({
    datePreset: ['last30'],
    dateFrom: [''],
    dateTo: [''],
    merchantId: [''],
    branchId: [''],
    terminalId: [''],
    acquirerBank: [''],
    cardBrand: [''],
    cardType: [''],
    mccCategory: [''],
    city: [''],
    department: [''],
    currency: [''],
  });

  ngOnInit(): void {
    this.applyIncomingFilters();
    this.refreshDependentOptions();

    this.form.get('merchantId')!.valueChanges.subscribe(() => {
      this.form.patchValue({ branchId: '', terminalId: '' }, { emitEvent: false });
      this.refreshDependentOptions();
    });
    this.form.get('branchId')!.valueChanges.subscribe(() => {
      this.form.patchValue({ terminalId: '' }, { emitEvent: false });
      this.refreshDependentOptions();
    });
    this.form.valueChanges.subscribe(() => this.emitFilters());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.applyIncomingFilters();
      this.refreshDependentOptions();
    }
  }

  private applyIncomingFilters(): void {
    this.suppressEmit = true;
    this.form.patchValue(
      {
        datePreset: this.filters.datePreset,
        dateFrom: this.filters.dateFrom ?? '',
        dateTo: this.filters.dateTo ?? '',
        merchantId: this.filters.merchantId ?? '',
        branchId: this.filters.branchId ?? '',
        terminalId: this.filters.terminalId ?? '',
        acquirerBank: this.filters.acquirerBank ?? '',
        cardBrand: this.filters.cardBrand ?? '',
        cardType: this.filters.cardType ?? '',
        mccCategory: this.filters.mccCategory ?? '',
        city: this.filters.city ?? '',
        department: this.filters.department ?? '',
        currency: this.filters.currency ?? '',
      },
      { emitEvent: false },
    );
    this.suppressEmit = false;
  }

  private refreshDependentOptions(): void {
    const merchantId = this.form.value.merchantId;
    this.filteredBranches = merchantId
      ? this.options.branches.filter(b => b.merchantId === merchantId)
      : this.options.branches;
    const branchId = this.form.value.branchId;
    this.filteredTerminals = branchId ? this.options.terminals.filter(t => t.branchId === branchId) : [];
  }

  selectPreset(preset: DateRangePreset): void {
    this.form.patchValue({
      datePreset: preset,
      ...(preset !== 'custom' ? { dateFrom: '', dateTo: '' } : {}),
    });
  }

  private emitFilters(): void {
    if (this.suppressEmit) return;
    const v = this.form.getRawValue();
    this.filtersChange.emit({
      datePreset: (v.datePreset || 'last30') as DateRangePreset,
      dateFrom: v.dateFrom || null,
      dateTo: v.dateTo || null,
      merchantId: v.merchantId || null,
      branchId: v.branchId || null,
      terminalId: v.terminalId || null,
      acquirerBank: v.acquirerBank || null,
      cardBrand: (v.cardBrand || null) as CardBrand | null,
      cardType: (v.cardType || null) as CardType | null,
      mccCategory: (v.mccCategory || null) as MccCategory | null,
      city: v.city || null,
      department: v.department || null,
      currency: (v.currency || null) as BizCurrency | null,
    });
  }

  clearAll(): void {
    this.form.reset({
      datePreset: 'last30',
      dateFrom: '',
      dateTo: '',
      merchantId: '',
      branchId: '',
      terminalId: '',
      acquirerBank: '',
      cardBrand: '',
      cardType: '',
      mccCategory: '',
      city: '',
      department: '',
      currency: '',
    });
  }

  get hasActiveFilters(): boolean {
    const v = this.form.value;
    return !!(
      v.merchantId || v.branchId || v.terminalId || v.acquirerBank || v.cardBrand ||
      v.cardType || v.mccCategory || v.city || v.department || v.currency ||
      v.datePreset !== 'last30'
    );
  }
}
