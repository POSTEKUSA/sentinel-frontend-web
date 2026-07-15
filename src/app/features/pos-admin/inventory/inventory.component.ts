import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CentralInventoryTabComponent } from './central-inventory-tab.component';
import { ByLocationTabComponent } from './by-location-tab.component';
import { CustodyTabComponent } from './custody-tab.component';
import { AccessoryStockTabComponent } from './accessory-stock-tab.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    CentralInventoryTabComponent,
    ByLocationTabComponent,
    CustodyTabComponent,
    AccessoryStockTabComponent,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  activeTab: 'central' | 'location' | 'custody' | 'accessories' = 'central';

  @ViewChild(CustodyTabComponent) custodyTab?: CustodyTabComponent;
  @ViewChild(AccessoryStockTabComponent) accessoryTab?: AccessoryStockTabComponent;

  openCustodyAssign(): void {
    this.custodyTab?.openAssignDialog();
  }

  openAccessoryMovement(): void {
    this.accessoryTab?.openRegisterDialog();
  }
}
