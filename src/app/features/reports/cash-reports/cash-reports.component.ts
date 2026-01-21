import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashService } from '../../../core/services/cash.service';
import { BranchService } from '../../../core/services/branch.service';
import { ClpCurrencyPipe } from '../../../shared/pipes/clp-currency.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cash-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ClpCurrencyPipe],
  template: `
    <div class="container-fluid">
        <h2 class="mb-4">Reportes de Cierre de Caja</h2>
        
        <!-- Filters -->
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">Fecha</label>
                        <input type="date" class="form-control" [(ngModel)]="filterDate" (change)="loadShifts()">
                    </div>
                     <div class="col-md-4" *ngIf="userRole === 'admin'">
                        <label class="form-label">Sucursal</label>
                        <select class="form-select" [(ngModel)]="filterBranch" (change)="loadShifts()">
                            <option value="">Todas</option>
                            <option *ngFor="let b of branches" [value]="b._id">{{ b.name }}</option>
                        </select>
                    </div>
                     <div class="col-md-4 d-flex align-items-end gap-2">
                        <button class="btn btn-primary flex-grow-1" (click)="loadShifts()">
                            <i class="bi bi-filter me-2"></i> Filtrar
                        </button>
                        <button class="btn btn-outline-danger flex-grow-1" (click)="downloadDailyReport()">
                            <i class="bi bi-file-pdf me-2"></i> Reporte Diario
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="card shadow-sm">
            <div class="card-body p-0">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Fecha Apertura</th>
                            <th>Fecha Cierre</th>
                            <th>Usuario</th>
                            <th>Sucursal</th>
                            <th>Apertura</th>
                            <th>Ventas Caja</th>
                            <th>Ventas Tarjeta</th>
                            <th>Total Ventas</th>
                            <th>Esperado</th>
                            <th>Real</th>
                            <th>Diferencia</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let shift of shifts">
                            <td>{{ shift.startTime | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td>
                                {{ shift.endTime | date:'dd/MM/yyyy HH:mm' }} 
                                <span *ngIf="!shift.endTime" class="badge bg-warning">Abierto</span>
                            </td>
                            <td>{{ shift.user?.name }}</td>
                            <td>{{ shift.branch?.name }}</td>
                            <td>{{ shift.startAmount | clpCurrency }}</td>
                            <td>{{ shift.cashSalesTotal | clpCurrency }}</td>
                            <td>{{ shift.cardSalesTotal | clpCurrency }}</td>
                            <td class="fw-bold">{{ shift.salesTotal | clpCurrency }}</td>
                            <td>{{ shift.expectedCash | clpCurrency }}</td>
                            <td>{{ shift.actualCash | clpCurrency }}</td>
                            <td [ngClass]="{'text-danger': shift.difference < 0, 'text-success': shift.difference > 0}">
                                {{ shift.difference | clpCurrency }}
                            </td>
                            <td>
                                <span class="badge" [ngClass]="{'bg-success': shift.status === 'closed', 'bg-primary': shift.status === 'open'}">
                                    {{ shift.status === 'closed' ? 'Cerrado' : 'Abierto' }}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" *ngIf="shift.status === 'closed'" (click)="downloadShiftReport(shift._id)">
                                    <i class="bi bi-file-earmark-pdf"></i>
                                </button>
                            </td>
                        </tr>
                        <tr *ngIf="shifts.length === 0">
                            <td colspan="13" class="text-center py-4">No se encontraron cierres de caja.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `,
  styles: []
})
export class CashReportsComponent implements OnInit {
  shifts: any[] = [];
  branches: any[] = [];
  userRole: string = '';
  
  filterDate: string = '';
  filterBranch: string = '';

  constructor(
      private cashService: CashService,
      private branchService: BranchService,
      private authService: AuthService
  ) {
      this.userRole = this.authService.getUserRole();
      // Default to today
      this.filterDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
      this.loadShifts();
      if (this.userRole === 'admin') {
          this.loadBranches();
      }
  }

  loadShifts() {
      let params: any = { date: this.filterDate };
      if (this.filterBranch) params.branch = this.filterBranch;
      
      this.cashService.getShifts(params).subscribe(res => {
          this.shifts = res.data;
      });
  }

  loadBranches() {
      this.branchService.getBranches().subscribe(res => this.branches = res.data);
  }

  downloadShiftReport(shiftId: string) {
      this.cashService.downloadShiftReport(shiftId).subscribe(blob => {
          const url = window.URL.createObjectURL(blob);
          window.open(url);
      });
  }

  downloadDailyReport() {
      const params: any = { date: this.filterDate };
      if (this.filterBranch) params.branch = this.filterBranch;

      this.cashService.downloadDailyReport(params).subscribe(blob => {
          const url = window.URL.createObjectURL(blob);
          window.open(url);
      });
  }
}
