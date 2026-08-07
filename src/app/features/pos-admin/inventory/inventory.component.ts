import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CentralInventoryTabComponent } from './central-inventory-tab.component';
import { ByLocationTabComponent } from './by-location-tab.component';
import { CustodyTabComponent } from './custody-tab.component';
import { AccessoryStockTabComponent } from './accessory-stock-tab.component';
import { SimInventoryTabComponent } from './sim-inventory-tab.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    CentralInventoryTabComponent,
    ByLocationTabComponent,
    CustodyTabComponent,
    AccessoryStockTabComponent,
    SimInventoryTabComponent,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  /** Tabs principales: POS (default) | Accesorios | Consumibles | SIM */
  activeTab: 'pos' | 'accessories' | 'consumables' | 'sim' = 'pos';
  /** Sub-vistas dentro de POS */
  posSubTab: 'central' | 'location' | 'custody' = 'central';

  @ViewChild(CustodyTabComponent) custodyTab?: CustodyTabComponent;
  @ViewChild('accessoryStock') accessoryTab?: AccessoryStockTabComponent;
  @ViewChild('consumableStock') consumableTab?: AccessoryStockTabComponent;

  openCustodyAssign(): void {
    this.custodyTab?.openAssignDialog();
  }

  openAccessoryMovement(): void {
    this.accessoryTab?.openRegisterDialog();
  }

  openConsumableMovement(): void {
    this.consumableTab?.openRegisterDialog();
  }
}
