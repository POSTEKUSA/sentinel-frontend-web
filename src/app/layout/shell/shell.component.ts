import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import appConfig from '../../core/config/app-config.json';
import packageJson from '../../../../package.json';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  appName = appConfig.appName;
  appDescription = appConfig.appDescription;
  companyName = appConfig.companyName;
  establishedYear = appConfig.establishedYear;
  currentYear = new Date().getFullYear();
  copyrightText = `© ${this.companyName} ${this.establishedYear} - ${this.currentYear}`;
  appVersion = 'v' + appConfig.appVersion; //+ packageJson.version;

  navSections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Device List', icon: 'smartphone', route: '/device-list' },
        { label: 'Device Map', icon: 'map', route: '/device-map' },
      ],
    },
    {
      title: 'Administración POS',
      items: [
        { label: 'Catálogo Maestro', icon: 'category', route: '/pos-admin/catalog' },
        { label: 'Órdenes de Compra', icon: 'receipt_long', route: '/pos-admin/purchase-orders' },
        { label: 'Recepción de Equipos', icon: 'move_to_inbox', route: '/pos-admin/receiving' },
        { label: 'Inventario', icon: 'inventory_2', route: '/pos-admin/inventory' },
        { label: 'Afiliados / Comercios', icon: 'storefront', route: '/pos-admin/merchants' },
      ],
    },
  ];
}
