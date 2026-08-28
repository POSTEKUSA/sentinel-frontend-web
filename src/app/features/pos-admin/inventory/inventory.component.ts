import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CentralInventoryTabComponent } from './central-inventory-tab.component';
import { ByLocationTabComponent } from './by-location-tab.component';
import { CustodyTabComponent } from './custody-tab.component';
import { PartInventoryTabComponent } from './part-inventory-tab.component';
import { SimInventoryTabComponent } from './sim-inventory-tab.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    CentralInventoryTabComponent,
    ByLocationTabComponent,
    CustodyTabComponent,
    PartInventoryTabComponent,
    SimInventoryTabComponent,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  /** Tabs: Terminales (default) | Accesorios | Consumibles | SIM */
  activeTab: 'terminals' | 'accessories' | 'consumables' | 'sim' = 'terminals';
  /** Sub-vistas solo dentro de Terminales */
  posSubTab: 'central' | 'location' | 'custody' = 'central';

  @ViewChild(CustodyTabComponent) custodyTab?: CustodyTabComponent;

  openCustodyAssign(): void {
    this.custodyTab?.openAssignDialog();
  }
}
