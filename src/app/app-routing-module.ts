import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'device-list',
        loadComponent: () =>
          import('./features/device-list/device-list.component').then(m => m.DeviceListComponent),
      },
      {
        path: 'device-info/:id',
        loadComponent: () =>
          import('./features/device-info/device-info.component').then(m => m.DeviceInfoComponent),
      },
      {
        path: 'device-map',
        loadComponent: () =>
          import('./features/device-map/device-map.component').then(m => m.DeviceMapComponent),
      },
      {
        path: 'pos-admin/catalog',
        loadComponent: () =>
          import('./features/pos-admin/catalog/catalog.component').then(m => m.CatalogComponent),
      },
      {
        path: 'pos-admin/purchase-orders',
        loadComponent: () =>
          import('./features/pos-admin/purchase-orders/purchase-order-list.component').then(
            m => m.PurchaseOrderListComponent,
          ),
      },
      {
        path: 'pos-admin/purchase-orders/:id',
        loadComponent: () =>
          import('./features/pos-admin/purchase-orders/purchase-order-form.component').then(
            m => m.PurchaseOrderFormComponent,
          ),
      },
      {
        path: 'pos-admin/receiving',
        loadComponent: () =>
          import('./features/pos-admin/receiving/receiving.component').then(m => m.ReceivingComponent),
      },
      {
        path: 'pos-admin/inventory',
        loadComponent: () =>
          import('./features/pos-admin/inventory/inventory.component').then(m => m.InventoryComponent),
      },
      {
        path: 'pos-admin/merchants',
        loadComponent: () =>
          import('./features/pos-admin/merchants/merchant-list.component').then(
            m => m.MerchantListComponent,
          ),
      },
      {
        path: 'pos-admin/merchants/:id',
        loadComponent: () =>
          import('./features/pos-admin/merchants/merchant-detail.component').then(
            m => m.MerchantDetailComponent,
          ),
      },
      {
        path: 'pmt/dashboard',
        loadComponent: () => import('./features/pmt/pmt-dashboard/pmt-dashboard.component').then(m => m.PmtDashboardComponent),
      },
      {
        path: 'pmt/inventory',
        loadComponent: () => import('./features/pmt/pmt-inventory/pmt-inventory.component').then(m => m.PmtInventoryComponent),
      },
      {
        path: 'pmt/bodega',
        loadComponent: () => import('./features/pmt/pmt-bodega/pmt-bodega.component').then(m => m.PmtBodegaComponent),
      },
      {
        path: 'pmt/pos-inyeccion',
        loadComponent: () => import('./features/pmt/pmt-pos-inyeccion/pmt-pos-inyeccion.component').then(m => m.PmtPosInyeccionComponent),
      },
      {
        path: 'pmt/asignados',
        loadComponent: () => import('./features/pmt/pmt-asignados/pmt-asignados.component').then(m => m.PmtAsignadosComponent),
      },
      {
        path: 'pmt/reparacion',
        loadComponent: () => import('./features/pmt/pmt-reparacion/pmt-reparacion.component').then(m => m.PmtReparacionComponent),
      },
      {
        path: 'pmt/garantia',
        loadComponent: () => import('./features/pmt/pmt-garantia/pmt-garantia.component').then(m => m.PmtGarantiaComponent),
      },
      {
        path: 'pmt/inicializaciones',
        loadComponent: () => import('./features/pmt/pmt-inicializaciones/pmt-inicializaciones.component').then(m => m.PmtInicializacionesComponent),
      },
      {
        path: 'pmt/sim-cards',
        loadComponent: () => import('./features/pmt/pmt-sim-cards/pmt-sim-cards.component').then(m => m.PmtSimCardsComponent),
      },
      {
        path: 'pmt/solicitudes-soporte',
        loadComponent: () => import('./features/pmt/pmt-solicitudes-soporte/pmt-solicitudes-soporte.component').then(m => m.PmtSolicitudesSoporteComponent),
      },
      {
        path: 'pmt/solicitudes-equipo',
        loadComponent: () => import('./features/pmt/pmt-solicitudes-equipo/pmt-solicitudes-equipo.component').then(m => m.PmtSolicitudesEquipoComponent),
      },
      {
        path: 'pmt/control-pos',
        loadComponent: () => import('./features/pmt/pmt-control-pos/pmt-control-pos.component').then(m => m.PmtControlPosComponent),
      },
      {
        path: 'pmt/historical-records',
        loadComponent: () => import('./features/pmt/pmt-historical-records/pmt-historical-records.component').then(m => m.PmtHistoricalRecordsComponent),
      },
      {
        path: 'pmt/assigned-pos-history',
        loadComponent: () => import('./features/pmt/pmt-assigned-pos-history/pmt-assigned-pos-history.component').then(m => m.PmtAssignedPosHistoryComponent),
      },
      {
        path: 'pmt/query',
        loadComponent: () => import('./features/pmt/pmt-query/pmt-query.component').then(m => m.PmtQueryComponent),
      },
      {
        path: 'pmt/bulk-upload',
        loadComponent: () => import('./features/pmt/pmt-bulk-upload/pmt-bulk-upload.component').then(m => m.PmtBulkUploadComponent),
      },
      {
        path: 'pmt/users',
        loadComponent: () => import('./features/pmt/pmt-users/pmt-users.component').then(m => m.PmtUsersComponent),
      },
      {
        path: 'pmt/soporte',
        loadComponent: () => import('./features/pmt/pmt-soporte-pmt/pmt-soporte-pmt.component').then(m => m.PmtSoportePmtComponent),
      }
    ],
  },
  {
    path: '**',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
