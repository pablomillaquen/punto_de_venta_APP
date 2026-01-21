import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  { 
    path: '', 
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
        { path: '', redirectTo: 'pos', pathMatch: 'full' },
        {
            path: 'pos',
            loadComponent: () => import('./features/pos/pos.component').then(m => m.PosComponent)
        },
        {
            path: 'inventory',
            loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent)
        },
        {
            path: 'users',
            loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent),
            canActivate: [authGuard]
        },
        {
            path: 'sales',
            loadComponent: () => import('./features/sales/sales.component').then(m => m.SalesComponent),
            canActivate: [authGuard]
        },
        {
            path: 'cash-reports',
            loadComponent: () => import('./features/reports/cash-reports/cash-reports.component').then(m => m.CashReportsComponent),
            canActivate: [authGuard]
        }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
