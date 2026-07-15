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
