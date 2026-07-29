import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BusyLoaderService } from '../../core/services/busy-loader.service';
import { PageChromeService } from '../../core/services/page-chrome.service';
import { BusyLoaderComponent } from '../../shared/busy-loader/busy-loader.component';
import appConfig from '../../core/config/app-config.json';

interface NavItem {
  label: string;
  icon: 'dashboard' | 'devices' | 'map' | 'catalog' | 'orders' | 'receiving' | 'inventory' | 'merchants' | string;
  route: string;
}

interface NavSection {
  title?: string;
  expanded?: boolean;
  items: NavItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, BusyLoaderComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent implements AfterViewInit, OnDestroy {
  @ViewChild('logoImg') logoImg?: ElementRef<HTMLImageElement>;

  appName = appConfig.appName;
  appDescription = appConfig.appDescription;
  companyName = appConfig.companyName;
  establishedYear = appConfig.establishedYear;
  currentYear = new Date().getFullYear();
  copyrightText = `© ${this.companyName} ${this.establishedYear} - ${this.currentYear}`;
  appVersion = 'v' + appConfig.appVersion;

  sidebarOpen = signal(false);
  pageTitle = signal('Vista general de la flota');
  pageIcon = signal<NavItem['icon']>('dashboard');
  private navSub?: Subscription;

  navSections: NavSection[] = [
    {
      title: 'Monitoreo',
      expanded: true,
      items: [
        { label: 'Vista General', icon: 'dashboard', route: '/dashboard' },
        { label: 'Dispositivos', icon: 'devices', route: '/device-list' },
        { label: 'Mapa', icon: 'map', route: '/device-map' },
      ],
    },
    {
      title: 'Administración',
      expanded: true,
      items: [
        { label: 'Catálogos', icon: 'catalog', route: '/pos-admin/catalog' },
        { label: 'Compras', icon: 'orders', route: '/pos-admin/purchase-orders' },
        { label: 'Recepción', icon: 'receiving', route: '/pos-admin/receiving' },
        { label: 'Inventario', icon: 'inventory', route: '/pos-admin/inventory' },
        { label: 'Comercios', icon: 'merchants', route: '/pos-admin/merchants' },
      ],
    },
    {
      title: 'OLD Control POS',
      expanded: true,
      items: [
        { label: 'Vista General', icon: 'dashboard', route: '/pmt/dashboard' },
        { label: 'Inventario', icon: 'inventory_2', route: '/pmt/inventory' },
        { label: 'Bodega', icon: 'inventory', route: '/pmt/bodega' },
        { label: 'POS Inyección', icon: 'vaccines', route: '/pmt/pos-inyeccion' },
        { label: 'Asignados', icon: 'manage_accounts', route: '/pmt/asignados' },
        { label: 'Reparación', icon: 'build', route: '/pmt/reparacion' },
        { label: 'Garantía', icon: 'shield', route: '/pmt/garantia' },
        { label: 'Inicializaciones', icon: 'settings_power', route: '/pmt/inicializaciones' },
        { label: 'SIM Cards', icon: 'sim_card', route: '/pmt/sim-cards' },
        { label: 'Soporte Equipo', icon: 'support_agent', route: '/pmt/solicitudes-soporte' },
        { label: 'Solicitudes Equipo', icon: 'hardware', route: '/pmt/solicitudes-equipo' },
        { label: 'Control POS', icon: 'receipt_long', route: '/pmt/control-pos' },
        { label: 'Historial', icon: 'history', route: '/pmt/historical-records' },
        { label: 'Asignados Hist.', icon: 'swap_horiz', route: '/pmt/assigned-pos-history' },
        { label: 'Query POS', icon: 'database', route: '/pmt/query' },
        { label: 'Subir Inventario', icon: 'upload_file', route: '/pmt/subir-inventario' },
        { label: 'Bulk Upload', icon: 'cloud_upload', route: '/pmt/bulk-upload' },
        { label: 'Usuarios', icon: 'group', route: '/pmt/users' },
        { label: 'Soporte PMT', icon: 'headset_mic', route: '/pmt/soporte-pmt' },
      ],
    },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    public busy: BusyLoaderService,
    public pageChrome: PageChromeService,
  ) {
    this.applyPageMeta(this.router.url);
    this.navSub = this.router.events
      .pipe(
        filter(
          e =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError,
        ),
      )
      .subscribe(e => {
        if (e instanceof NavigationEnd) {
          this.applyPageMeta(e.urlAfterRedirects);
        }
        if (!this.busy.allowsNavTracking()) return;
        if (e instanceof NavigationStart) {
          this.busy.show();
        } else {
          this.busy.hide();
        }
      });
  }

  get loaderVisible(): boolean {
    return this.busy.visible();
  }

  private applyPageMeta(url: string): void {
    const meta = this.resolvePage(url);
    this.pageTitle.set(meta.title);
    this.pageIcon.set(meta.icon);
  }

  private resolvePage(url: string): { title: string; icon: NavItem['icon'] } {
    const path = url.split('?')[0];
    if (path.startsWith('/device-info')) return { title: 'Detalle de dispositivo', icon: 'devices' };
    if (path.startsWith('/device-list')) return { title: 'Dispositivos', icon: 'devices' };
    if (path.startsWith('/device-map')) return { title: 'Mapa', icon: 'map' };
    if (path.startsWith('/pos-admin/catalog')) return { title: 'Catálogos', icon: 'catalog' };
    if (path.startsWith('/pos-admin/purchase-orders/new')) return { title: 'Nueva orden de compra', icon: 'orders' };
    if (/^\/pos-admin\/purchase-orders\/[^/]+/.test(path)) return { title: 'Orden de compra', icon: 'orders' };
    if (path.startsWith('/pos-admin/purchase-orders')) return { title: 'Compras', icon: 'orders' };
    if (path.startsWith('/pos-admin/receiving')) return { title: 'Recepción', icon: 'receiving' };
    if (path.startsWith('/pos-admin/inventory')) return { title: 'Inventario', icon: 'inventory' };
    if (/^\/pos-admin\/merchants\/[^/]+/.test(path)) return { title: 'Comercio', icon: 'merchants' };
    if (path.startsWith('/pos-admin/merchants')) return { title: 'Comercios', icon: 'merchants' };
    if (path.startsWith('/dashboard')) return { title: 'Vista general de la flota', icon: 'dashboard' };
    if (path.startsWith('/pmt/dashboard')) return { title: 'Vista General', icon: 'dashboard' };
    if (path.startsWith('/pmt/')) return { title: 'Control POS', icon: 'inventory' };
    return { title: this.appName, icon: 'dashboard' };
  }

  ngAfterViewInit(): void {
    const logo = this.logoImg?.nativeElement;
    if (!logo) return;
    logo.addEventListener('animationend', this.onLogoAnimationEnd);
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    const logo = this.logoImg?.nativeElement;
    logo?.removeEventListener('animationend', this.onLogoAnimationEnd);
  }

  private onLogoAnimationEnd = (e: AnimationEvent): void => {
    const el = e.target as HTMLElement;
    if (e.animationName === 'logoSpin') {
      el.classList.remove('spin');
    } else if (e.animationName === 'logoEnter') {
      el.classList.remove('enter');
    }
  };

  spinLogo(): void {
    const logo = this.logoImg?.nativeElement;
    if (!logo) return;
    logo.classList.remove('spin');
    void logo.offsetWidth;
    logo.classList.add('spin');
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleSection(section: NavSection): void {
    section.expanded = !section.expanded;
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  async logout(): Promise<void> {
    this.busy.suspendNavTracking();
    this.busy.reset();
    this.busy.show('Cerrando sesión');
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.auth.logout();
    this.busy.reset();
    await this.router.navigateByUrl('/login');
    this.busy.resumeNavTracking();
  }
}
