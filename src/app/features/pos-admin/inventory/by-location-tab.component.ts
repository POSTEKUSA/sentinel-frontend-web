import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { PosLocationType, PosUnit, POS_LOCATION_LABELS } from '../../../core/models/pos-admin';
import { PosInventoryService } from '../../../core/services/pos-admin/pos-inventory.service';

const LOCATION_ICONS: Record<PosLocationType, string> = {
  central_warehouse: 'warehouse',
  regional_warehouse: 'store',
  executive: 'badge',
  technician: 'engineering',
  merchant: 'storefront',
  workshop: 'build',
  in_transit: 'local_shipping',
  decommissioned: 'delete_outline',
  destroyed: 'delete_forever',
};

@Component({
  selector: 'app-by-location-tab',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule],
  templateUrl: './by-location-tab.component.html',
  styleUrl: './by-location-tab.component.css',
})
export class ByLocationTabComponent implements OnInit {
  locationLabels: Record<string, string> = POS_LOCATION_LABELS;
  locationIcons: Record<string, string> = LOCATION_ICONS;

  units: PosUnit[] = [];
  counts: { locationType: PosLocationType; label: string; count: number }[] = [];
  expanded: PosLocationType | null = null;
  detailColumns = ['serialNumber', 'brand', 'model', 'locationLabel', 'receivedAt'];

  constructor(private inventorySvc: PosInventoryService) {}

  ngOnInit(): void {
    this.inventorySvc.units$.subscribe(units => {
      this.units = units;
      this.counts = this.inventorySvc.countByLocation();
    });
  }

  totalUnits(): number {
    return this.units.length;
  }

  toggle(locationType: PosLocationType): void {
    this.expanded = this.expanded === locationType ? null : locationType;
  }

  unitsFor(locationType: PosLocationType): PosUnit[] {
    return this.units.filter(u => u.locationType === locationType);
  }
}
