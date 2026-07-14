import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { CentralInventoryTabComponent } from './central-inventory-tab.component';
import { ByLocationTabComponent } from './by-location-tab.component';
import { CustodyTabComponent } from './custody-tab.component';
import { AccessoryStockTabComponent } from './accessory-stock-tab.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule, MatTabsModule, MatIconModule,
    CentralInventoryTabComponent, ByLocationTabComponent, CustodyTabComponent, AccessoryStockTabComponent,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {}
