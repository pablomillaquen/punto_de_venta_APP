import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../core/services/sales.service';
import { BranchService } from '../../core/services/branch.service';
import { AuthService } from '../../core/services/auth.service';
import { ClpCurrencyPipe } from '../../shared/pipes/clp-currency.pipe';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, ClpCurrencyPipe, FormsModule],
  templateUrl: './sales.component.html',
  styles: []
})
export class SalesComponent implements OnInit {
  sales: any[] = [];
  branches: any[] = [];
  todayTotal: number = 0;
  
  // User Context
  userRole: string = '';
  userId: string = '';

  // Filters
  filterBranch: string = '';
  filterDate: string = ''; // YYYY-MM-DD

  constructor(
      private salesService: SalesService,
      private branchService: BranchService,
      private authService: AuthService
  ) {
      this.userRole = this.authService.getUserRole();
      this.userId = this.authService.getUserId();
  }

  ngOnInit() {
    // Set default date to today
    this.filterDate = new Date().toISOString().split('T')[0];
    
    if (this.userRole === 'admin') {
        this.loadBranches();
    }
    this.loadSales();
  }

  loadSales() {
    let params: any = {};
    
    if (this.filterDate) params.date = this.filterDate;
    if (this.filterBranch) params.branch = this.filterBranch;

    this.salesService.getSales(params).subscribe((res: any) => {
      this.sales = res.data;
      this.calculateMetrics();
    });
  }

  loadBranches() {
      this.branchService.getBranches().subscribe((res: any) => {
          this.branches = res.data;
      });
  }
  
  calculateMetrics() {
      // Calculate total of SHOWN sales. 
      // Since we filter by date in backend, this total is correct for the selected date.
      this.todayTotal = this.sales.reduce((acc, s) => acc + s.totalAmount, 0);
  }

  onFilterChange() {
      this.loadSales();
  }

  getShortId(sale: any): string {
      return (sale._id || '').toString().slice(-6);
  }

  downloadReport() {
      const params: any = {};
      if (this.filterDate) params.date = this.filterDate;
      if (this.filterBranch) params.branch = this.filterBranch;

      this.salesService.downloadReport(params).subscribe((blob: Blob) => {
           const url = window.URL.createObjectURL(blob);
           window.open(url);
      }, err => console.error('Error downloading report', err));
  }
}
